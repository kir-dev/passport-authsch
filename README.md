# passport-authsch

This package is a strategy for [passport.js](https://passportjs.org/) and [AuthSCH](https://auth.sch.bme.hu/), and a few other things that we use in our NestJs applications related to authentication.

## Usage

To set up JWT authtentication with AuthSCH in a Nest.js application, follow these steps:

### Install packages

Install the following packages:

```bash
yarn add passport @nestjs/passport @kir-dev/passport-authsch passport-jwt @nestjs/jwt
```

### Create auth resource

Create an auth module, controller and service

```bash
nest g module auth
nest g controller auth
nest g service auth
```

### Create an AuthSch Strategy

This package exports a Strategy that you can use with passport.js and NestJS. To do this, you need to create a class that extends the exported Strategy using `@nestjs/passport`'s wrapper.

Create a file called `authsch.strategy.ts` in the `auth` directory.

```typescript
import { AuthSchProfile, AuthSchScope, Strategy } from '@kir-dev/passport-authsch';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthSchStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientId: '<your authSch clientId>',
      clientSecret: '<your authSch clientSecret',
      scopes: [AuthSchScope.BASIC, ...],
    });
  }

  async validate(userProfile: AuthSchProfile): Promise<any> {
    <<custom logic ...>>
  }
}
```

To use AuthSCH, we must provide a clientId, clientSecret and a list of scopes to the base class. You can generate an id and secret at [AuthSCH's website](https://auth.sch.bme.hu/console/create). The description of the scopes can be read in the passage about [AuthSchScopes](#AuthSchScope-and-AuthSchProfile).

The validate method will be called after the user decides to share their data and that data is retrieved from AuthSCH. The data is parsed by this library and passed as a parameter in the form of a `AuthSchProfile` object, read more in [the same passage](#AuthSchScope-and-AuthSchProfile). The validate method can be used for validating the user's data. You can create custom logic here, we usually check if they're already in our database, and if not, we insert them. If you return undefined or null from this method, the authentication will fail. If you return anything else, that value will be availabe on req.user on every subsequent request where the `@UseGuards(AuthGuard('authsch'))` decorator is present.

### Create a JWT strategy

AuthSCH is used for authenticating the user on their first login, but on subsequent logins we'll use JWTs. The `passport-jwt` library handles this, but once again we have to create a class to implement their logic.

Create a file called `jwt.strategy.ts` in the `auth` directory.

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '<your JWT secret>',
    });
  }

  validate(payload: User): User {
    return payload;
  }
}
```

Provide a secret in the constructor, change the other settings to your liking. No real validation needed in the validate method.

### Edit the Auth Module

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthSchStrategy } from './authsch.strategy';

@Module({
  providers: [AuthService, AuthSchStrategy, JwtStrategy],
  controllers: [AuthController],
  imports: [PassportModule, JwtModule],
})
export class AuthModule {}
```

### Edit the Auth Service

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: User): string {
    return this.jwtService.sign(user, {
      secret: '<your secret>',
      expiresIn: '7 days',
    });
  }
}
```

The login method will create a JWT token with the users data. Feel free to use custom logic here, also modify the the secret and expiration of the token.

### Edit the Auth Controller

```typescript
import { CurrentUser } from '@kir-dev/passport-authsch';
import { Controller, Get, Redirect, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  /**
   * Redirects to the authsch login page
   */
  @UseGuards(AuthGuard('authsch'))
  @Get('login')
  login() {
    // never called
  }

  /**
   * Endpoint for authsch to call after login
   * Redirects to the frontend with the jwt token
   */
  @Get('callback')
  @UseGuards(AuthGuard('authsch'))
  @Redirect()
  oauthRedirect(@CurrentUser() user: User) {
    const jwt = this.authService.login(user);
    return {
      url: `<your_frontend_url>?jwt=${jwt}`,
    };
  }
}
```

On your frontend, when the user clicks the login button, that should lead to to `<your_backend_url>/auth/login`. The AuthSch guard will redirect the user to the AuthSch login page and the body of this method will never be called.

When registering your AuthSch client, for the redirectUrl you should provide `<your_backend_url>/auth/redirect`. When the user signs in through AuthSch, it will call this endpoint. This strategy will retrieve the accessToken and the userData, run the `validate` method in `authsch.strategy.ts` and then call this method. The result of the `validate` method will be on the req.user, which the `@CurrentUser()` decorator extracts ([more on that here](#CurrentUser-decorator)). Then the JWT is generated and sent back to the frontend.

### Final steps

And with that, you're done! To enforce authentication on endpoints or controllers, add the `@UseGuards(AuthGuard('jwt))` decorator to the method or class. (If you're using Swagger, also add the `@ApiBearerAuth()`). If that endpoint is called without a JWT in the Authorization header, a 401 Unauthorized error will be returned. You can extract the user data with the `@CurrentUser()` decorator in the controller method parameters.

#### Example endpoint using the JWT authentication

```typescript
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Get(':id')
async findOne(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: UserEntity,
): Promise<...> {
  ...
}
```

[Example PR that implements authentication with this library in a NestJS app](https://github.com/kir-dev/BeAlcoholic/pull/27)

## Documentation

### AuthSchScope and AuthSchProfile

The available scopes of AuthSCH can be found [here](https://git.sch.bme.hu/kszk/authsch/-/wikis/api#jelenleg-t%C3%A1mogatott-t%C3%ADpusok-%C3%A9s-scope-k). The `AuthSchScope` is an enum that maps to these scopes. The `validate` method will get an object with type `AuthSchProfile` as parameter, which is not the same that AuthSch returns and their documentation describes. Here you can read the mapping in the following format: enum name - scope name - property in AuthSchProfile. **NOTE: Only those properties will be on the object in the validate method whose scope was provided in the constructor. The other fields will be undefined, but the type can't reflect that!**

- BASIC - basic - authSchId
- DISPLAY_NAME - displayName - displayName
- LAST_NAME - sn - lastName
- FIRST_NAME - givenName - givenName
- EMAIL - mail - email
- NEPTUN - niifPersonOrgID - neptun
- LINKED_ACCOUNTS - linkedAccounts - linkedAccounts (object with the following properties: bme, schacc, pekUserName)
- GROUP_MEMBERSHIPS - eduPersonEntitlement - groupMemberships (object with the following properties: pekGroupId, groupName, status, posts, start, end)
- MOBILE - mobile - mobile
- ATTENDED_COURSES - niifEduPersonAttendedCourse - attendedCourseCodes
- BME_STATUS - bmeunitscope - bmeStatus
- ADDRESS - permanentaddress - address
- ENTRANTS - entrants - entrants (object with the following properties: pekGroupId, groupName, entrantType)

### CurrentUser decorator

This package also exports two NestJs decorators, CurrentUser and CurrentUserOptional. CurrentUser extracts the `user` property from the current request object. If there's no `user` property, it throws an `InternalServerError` exception. This usually happens when you used this decorator on an endpoint where the JWT or AuthSch guard wasn't used, and thus the user info wasn't available. The CurrentUserOptional does the same thing, but it doesn't throw an error if there's no user data, it just returns undefined. This can be beneficial on endpoints when authentication is optional.
