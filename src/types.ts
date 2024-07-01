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
  scopes: AuthSchScope[];
  loginEndpoint?: string;
  callbackEndpoint?: string;
};

export enum AuthSchScope {
  BASIC = 'basic',
  DISPLAY_NAME = 'displayName',
  LAST_NAME = 'sn',
  FIRST_NAME = 'givenName',
  EMAIL = 'mail',
  NEPTUN = 'niifPersonOrgID', // Requires special request, the client must be created by KSZK!
  LINKED_ACCOUNTS = 'linkedAccounts',
  GROUP_MEMBERSHIPS = 'eduPersonEntitlement',
  MOBILE = 'mobile',
  ATTENDED_COURSES = 'niifEduPersonAttendedCourse',
  BME_STATUS = 'bmeunitscope',
  ADDRESS = 'permanentaddress',
  ENTRANTS = 'entrants',
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
  internal_id: string;
  displayName: string;
  sn: string;
  givenName: string;
  mail: string;
  niifPersonOrgID: string;
  linkedAccounts: {
    bme: string;
    schacc: string;
    vir: number;
    virUid: string;
  };
  lastSync: {
    bme: number;
    schacc: number;
    vir: number;
    virUid: number;
  };
  eduPersonEntitlement: RawGroupMembership[];
  entrants: {
    groupId: number;
    groupName: string;
    entrantType: 'AB' | 'KB';
  }[];
  bmeunitscope: BmeUnitScope[];
  permanentaddress: string;
  niifEduPersonAttendedCourse: string; // BME course codes separated by ;
  mobile: string;
  neptun: string;
};

export type AuthSchProfile = {
  authSchId: string;
  displayName: string;
  lastName: string;
  firstName: string;
  email: string;
  linkedAccounts: {
    bme: string;
    schacc: string;
    pekUserName: string;
  };
  groupMemberships: {
    pekGroupId: number;
    groupName: string;
    status: 'körvezető' | 'tag' | 'öregtag';
    posts: string[];
    start: string;
    end?: string;
  }[];
  entrants: {
    pekGroupId: number;
    groupName: string;
    entrantType: 'AB' | 'KB';
  }[];
  bmeStatus: BmeUnitScope[];
  address: string;
  attendedCourseCodes: string[];
  mobile: string;
  neptun: string;
};
