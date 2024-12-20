export type AuthSchTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string[];
  refresh_token: string;
};

export type StrategyParams = {
  clientId: string;
  clientSecret: string;
  stateSecret: string;
  scopes: AuthSchScope[];
  loginEndpoint?: string;
  callbackEndpoint?: string;
  redirectUri?: string;
};

export enum AuthSchScope {
  // OPENID = 'openid', This is required with AuthSCH v2, so the lib will provide it by default
  PROFILE = 'profile',
  EMAIL = 'email',
  PHONE = 'phone',
  ADDRESS = 'address',
  // OFFLINE_ACCESS = 'offline_access' the lib currently doesn't support refresh tokens, so it's useless
  ROLES = 'roles',
  EDU_ID = 'bme.hu:eduPersonPrincipalName',
  NEPTUN = 'bme.hu:niifPersonOrgID', // only with special request!
  ATTENDED_COURSES = 'bme.hu:niifPersonAttendedCourse', // only with special request!
  BME_STATUS = 'meta.bme.hu:unitScope',
  SCH_GROUPS = 'directory.sch.bme.hu:groups',
  SCHACC_ID = 'directory.sch.bme.hu:sAMAccountName',
  PEK_PROFILE = 'pek.sch.bme.hu:profile',
}

export enum BmeUnitScope {
  BME = 'BME',
  BME_NEWBIE = 'BME_NEWBIE',
  BME_VIK = 'BME_VIK',
  BME_VIK_ACTIVE = 'BME_VIK_ACTIVE',
  BME_VIK_NEWBIE = 'BME_VIK_NEWBIE',
  BME_VBK = 'BME_VBK',
  BME_VBK_ACTIVE = 'BME_VBK_ACTIVE',
  BME_VBK_NEWBIE = 'BME_VBK_NEWBIE',
}

export type RawGroupMembership = {
  id: number;
  name: string;
  status: 'körvezető' | 'tag' | 'öregtag';
  title: string[];
  start: string;
  end?: string;
};

export type RawAuthSchProfile = {
  name: string;
  family_name: string;
  given_name: string;
  birthdate: string;
  address: {
    formatted: string;
  };
  'bme.hu:niifPersonOrgID': string;
  'bme.hu:eduPersonPrincipalName': string;
  'bme.hu:niifEduPersonAttendedCourse/v1': string[];
  'meta.bme.hu:unitScope/v1': string;
  'meta.bme.hu:updated_at': number;
  email: string;
  email_verified: boolean;
  'directory.sch.bme.hu:groups/v1': string[];
  'directory.sch.bme.hu:sAMAccountName': string;
  'meta.directory.sch.bme.hu:updated_at': number;
  'pek.sch.bme.hu:entrants/v1': {
    groupId: number;
    groupName: string;
    entrantType: 'AB' | 'KB';
  }[];
  'pek.sch.bme.hu:executiveAt/v1': { id: number; name: string }[];
  'pek.sch.bme.hu:activeMemberships/v1': { id: number; name: string; title: string[] }[];
  'pek.sch.bme.hu:alumniMemberships/v1': { id: number; name: string; start: string; end: string }[];
  'pek.sch.bme.hu:uid': string;
  'meta.pek.sch.bme.hu:updated_at': number;
  phone_number: string;
  phone_number_verified: boolean;
  roles: string[];
  sub: string;
  updated_at: number;
};

export type AuthSchProfile = {
  authSchId: string;
  fullName: string;
  lastName: string;
  firstName: string;
  birthdate: string;
  email: string;
  emailVerfied: boolean;
  address: string;
  phone: string;
  phoneVerified: boolean;
  bme: {
    eduId: string;
    attendedCourses: string[];
    bmeStatus: BmeUnitScope[];
    neptun: string;
    updatedAt: number;
  };
  schAcc: {
    schAccUsername: string;
    groups: string[];
    roles: string[];
    updatedAt: number;
  };
  pek: {
    executiveAt: { groupId: number; groupName: string }[];
    activeMemberAt: { groupId: number; groupName: string; titles: string[] }[];
    alumniMemberAt: { groupId: number; groupName: string; start: string; end: string }[];
    pekId: string;
    updatedAt: number;
  };
  entrants: {
    groupId: number;
    groupName: string;
    entrantType: 'AB' | 'KB';
  }[];
};
