import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { Strategy as PassportStrategy } from 'passport-strategy';

import { AuthSchProfile, AuthSchTokenResponse, RawAuthSchProfile, StrategyParams } from './types.js';
import { parseAuthSchProfile } from './util.js';

const authSchProvider = process.env.AUTHSCH_PROVIDER || `https://auth.sch.bme.hu`;

export class Strategy extends PassportStrategy {
  private readonly tokenEndpoint = `${authSchProvider}/oauth2/token`;
  private readonly profileEndpoint = `${authSchProvider}/oidc/userinfo`;
  private readonly authEndpoint = `${authSchProvider}/site/login`;
  private clientId: string;
  private clientSecret: string;
  private stateSecret: string;
  private scopes: string;
  private loginEndpointSuffix: string;
  private callbackEndpointSuffix: string;
  private redirectUri?: string;
  name = 'authsch';

  constructor(params: StrategyParams) {
    super();
    this.clientId = params.clientId;
    this.clientSecret = params.clientSecret;
    this.stateSecret = params.stateSecret;
    this.scopes = ['openid', ...(params.scopes ?? [])].join('+');
    this.loginEndpointSuffix = params.loginEndpoint || 'login';
    this.callbackEndpointSuffix = params.callbackEndpoint || 'callback';
    this.redirectUri = params.redirectUri;
  }

  // eslint-disable-next-line
  async validate(_userProfile: AuthSchProfile): Promise<any> {
    throw new Error('Not implemented');
  }

  async authenticate(req: Request): Promise<void> {
    if (!this.clientId) {
      return this.error(new Error('No client id provided!'));
    }
    if (!this.clientSecret) {
      return this.error(new Error('No client secret provided!'));
    }
    if (req.path.endsWith(this.loginEndpointSuffix)) {
      return this.login(req);
    }
    if (req.path.endsWith(this.callbackEndpointSuffix)) {
      return await this.callback(req);
    }
    return this.pass();
  }

  login(req: Request) {
    const payload = {
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
      ip: req.ip,
    };
    const state = jwt.sign(payload, this.stateSecret, { expiresIn: '10m' });
    return this.redirect(
      `${this.authEndpoint}?response_type=code&client_id=${this.clientId}&scope=${this.scopes}&state=${state}${this.redirectUri ? `&redirect_uri=${this.redirectUri}` : ''}`
    );
  }

  async callback(req: Request) {
    const authorizationCode = req.query.code;
    const state = req.query.state as string;
    const error = req.query.error;
    if (error) {
      console.error(req.query.error_description ?? error);
      return this.fail(401);
    }
    if (!authorizationCode) {
      console.error('No authorization code received from AuthSch!');
      return this.fail(401);
    }
    if (!state) {
      console.error('No state received from AuthSch!');
      return this.fail(401);
    }
    try {
      const payload = jwt.verify(state, this.stateSecret) as string;
      if (JSON.parse(payload).ip !== req.ip) {
        console.error('CSRF validation failed!');
        return this.fail(403);
      }
    } catch {
      console.error('CSRF validation failed!');
      return this.fail(403);
    }

    const base64 = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const tokenResponse = await axios.post<string, AxiosResponse<AuthSchTokenResponse>>(
      this.tokenEndpoint,
      `grant_type=authorization_code&code=${authorizationCode}${this.redirectUri ? `&redirect_uri=${this.redirectUri}` : ''}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${base64}`,
        },
      }
    );
    if (!tokenResponse.data) {
      console.error('Fetching access token from AuthSch failed: ', tokenResponse.status);
      return this.fail(401);
    }

    const profileData = (
      await axios.get<RawAuthSchProfile>(this.profileEndpoint, {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
      })
    ).data;
    if (!profileData) {
      console.error('Fetching user profile from AuthSch failed: ', tokenResponse.status);
      return this.fail(401);
    }
    const validatedUser = await this.validate(parseAuthSchProfile(profileData));
    if (!validatedUser) {
      return this.fail(401);
    }
    this.success(validatedUser);
  }
}
