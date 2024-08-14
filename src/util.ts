import { AuthSchProfile, BmeUnitScope, RawAuthSchProfile } from './types';

export const parseAuthSchProfile = (profileData: RawAuthSchProfile): AuthSchProfile => ({
  authSchId: profileData.sub,
  fullName: profileData.name,
  lastName: profileData.family_name,
  firstName: profileData.given_name,
  birthdate: profileData.birthdate,
  email: profileData.email,
  emailVerfied: profileData.email_verified,
  bme: {
    eduId: profileData['bme.hu:eduPersonPrincipalName'],
    neptun: profileData['bme.hu:niifPersonOrgID'],
    bmeStatus: (profileData['meta.bme.hu:unitScope']?.split(' ') ?? []) as BmeUnitScope[],
    attendedCourses: profileData['bme.hu:niifEduPersonAttendedCourse/v1'],
    updatedAt: profileData['meta.bme.hu:updated_at'],
  },
  schAcc: {
    schAccUsername: profileData['directory.sch.bme.hu:sAMAccountName'],
    groups: profileData['directory.sch.bme.hu:groups/v1'],
    roles: profileData.roles,
    updatedAt: profileData['meta.directory.sch.bme.hu:updated_at'],
  },
  pek: {
    pekId: profileData['pek.sch.bme.hu:uid'],
    executiveAt: profileData['pek.sch.bme.hu:executiveAt/v1']?.map((m) => ({ groupId: m.id, groupName: m.name })),
    activeMemberAt: profileData['pek.sch.bme.hu:activeMemberships/v1']?.map((m) => ({
      groupId: m.id,
      groupName: m.name,
      titles: m.title,
    })),
    alumniMemberAt: profileData['pek.sch.bme.hu:alumniMemberships/v1']?.map((m) => ({
      groupId: m.id,
      groupName: m.name,
      start: m.start,
      end: m.end,
    })),
    updatedAt: profileData['meta.pek.sch.bme.hu:updated_at'],
  },
  entrants: profileData['pek.sch.bme.hu:entrants/v1']?.map((e) => ({
    groupId: e.groupId,
    groupName: e.groupName,
    entrantType: e.entrantType,
  })),
  address: profileData.address?.formatted,
  phone: profileData.phone_number,
  phoneVerified: profileData.phone_number_verified,
});
