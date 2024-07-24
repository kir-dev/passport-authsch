import { AuthSchProfile, RawAuthSchProfile, RawGroupMembership } from './types';

export const parseAuthSchProfile = (profileData: RawAuthSchProfile): AuthSchProfile => ({
  authSchId: profileData.internal_id,
  displayName: profileData.displayName,
  lastName: profileData.sn,
  firstName: profileData.givenName,
  email: profileData.mail,
  linkedAccounts: {
    bme: profileData.linkedAccounts?.bme,
    schacc: profileData.linkedAccounts?.schacc,
    pekUserName: profileData.linkedAccounts?.virUid,
  },
  groupMemberships: profileData.eduPersonEntitlement?.map((gm: RawGroupMembership) => ({
    pekGroupId: gm.id,
    groupName: gm.name,
    status: gm.status,
    posts: gm.title,
    start: gm.start,
    end: gm.end,
  })),
  entrants: profileData.entrants?.map((e) => ({
    pekGroupId: e.groupId,
    groupName: e.groupName,
    entrantType: e.entrantType,
  })),
  bmeStatus: profileData.bmeunitscope,
  address: profileData.permanentaddress,
  attendedCourseCodes: profileData.niifEduPersonAttendedCourse?.split(';'),
  mobile: profileData.mobile,
  neptun: profileData.niifPersonOrgID,
});
