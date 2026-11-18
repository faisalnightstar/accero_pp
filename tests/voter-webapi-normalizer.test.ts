import { describe, it, expect } from 'vitest';
import { normalizeWebApiInVoter } from '@/lib/verify/normalizers/webapiInNormalizer';

describe('WebAPI.in Voter Response Normalizer', () => {
  const sampleApiResponse = {
    status: true,
    message: 'voter details fetched successfully',
    debited: 2,
    remaining_balance: 4980440,
    epic: 'TMV0654962',
    data: {
      id: '219049822_TMV0654962_S24',
      epicId: 219049822,
      epicNumber: 'TMV0654962',
      formReferenceNo: 'S24165G8C2702261200097',
      applicantFirstName: 'Mo Wahid',
      applicantFirstNameL1: 'मो वाहिद',
      relationName: 'Mo Khalil',
      relationNameL1: 'मो खलील',
      age: 50,
      gender: 'M',
      partNumber: 212,
      partId: 442935,
      partName: 'MASTER MAIND PUBLIC SCHOOL ROOM NO.2',
      partNameL1: 'मास्टर माइंड पब्लिक स्कूल कक्ष सं0-२',
      partSerialNumber: 320,
      asmblyName: 'Unnao',
      asmblyNameL1: 'उन्नाव',
      acId: 167,
      acNumber: 165,
      prlmntName: 'Unnao',
      prlmntNo: '33',
      districtValue: 'Unnao',
      districtValueL1: 'उन्नाव',
      districtCd: 'S2458',
      districtId: 58,
      districtNo: 58,
      stateName: 'Uttar Pradesh',
      stateNameL1: 'उत्तर प्रदेश',
      stateId: 23,
      stateCd: 'S24',
      isActive: true,
      formType: 'F8',
      relationType: 'FTHR',
      createdDttm: '2023-05-25 18:44:34',
      modifiedDttm: '2026-06-17 12:14:19',
      fullName: 'mo wahid',
      fullNameL1: 'मो वाहिद',
      relativeFullName: 'mo khalil',
      relativeFullNameL1: 'मो खलील',
      houseNumber: 'XXX',
      houseNumberL1: 'XXX',
      localityStreet: 'Eidgah Road Near Vidya Vatika',
      localityStreetL1: 'ईदगाह रोड निअर विद्या वाटिका',
      townVillage: 'Gandhi nagar',
      townVillageL1: 'गांधी नगर',
      tehsil: 'Unnao Sadar',
      tehsilL1: 'उन्नाव सदर',
      electorType: 'G',
    },
  };

  it('normalizes standard WebAPI.in response into unified VoterCardData', () => {
    const card = normalizeWebApiInVoter(sampleApiResponse, 'TMV0654962');

    expect(card.epicNumber).toBe('TMV0654962');
    expect(card.electorName).toBe('Mo Wahid');
    expect(card.electorNameRegional).toBe('मो वाहिद');
    expect(card.relationName).toBe('Mo Khalil');
    expect(card.relationNameRegional).toBe('मो खलील');
    expect(card.relationType).toBe('FATHER');
    expect(card.gender).toBe('Male');
    expect(card.genderRegional).toBe('पुरुष');
    expect(card.age).toBe('50');
    expect(card.dateOfBirth).toBe('');
    expect(card.assemblyConstituency).toBe('165 - Unnao');
    expect(card.assemblyConstituencyRegional).toBe('165 - उन्नाव');
    expect(card.partNumberAndName).toBe('212 - MASTER MAIND PUBLIC SCHOOL ROOM NO.2');
    expect(card.partNumberAndNameRegional).toBe('212 - मास्टर माइंड पब्लिक स्कूल कक्ष सं0-२');
    expect(card.district).toBe('Unnao');
    expect(card.districtRegional).toBe('उन्नाव');
    expect(card.state).toBe('Uttar Pradesh');
    expect(card.stateRegional).toBe('उत्तर प्रदेश');
    expect(card.stateCode).toBe('S24');
    expect(card.templateVariant).toBe('hindi');
    expect(card.layoutFormat).toBe('cr80');
  });

  it('filters placeholder "XXX" house numbers from English and regional addresses', () => {
    const card = normalizeWebApiInVoter(sampleApiResponse, 'TMV0654962');

    // "XXX" should NOT be present in fullAddress
    expect(card.fullAddress).not.toContain('XXX');
    expect(card.fullAddressRegional).not.toContain('XXX');
    expect(card.fullAddress).toContain('Eidgah Road Near Vidya Vatika');
    expect(card.fullAddress).toContain('Gandhi nagar');
    expect(card.fullAddress).toContain('Unnao Sadar');
    expect(card.fullAddress).toContain('Unnao, Uttar Pradesh');
  });

  it('correctly maps husband relation type and regional labels', () => {
    const husbandPayload = {
      ...sampleApiResponse,
      data: {
        ...sampleApiResponse.data,
        relationType: 'HUSB',
        relationName: 'RAMESH KUMAR',
        relationNameL1: 'रमेश कुमार',
        gender: 'F',
      },
    };

    const card = normalizeWebApiInVoter(husbandPayload, 'TMV0654962');
    expect(card.relationType).toBe('HUSBAND');
    expect(card.gender).toBe('Female');
    expect(card.genderRegional).toBe('महिला');
    expect(card.labelRelationRegional).toBe('पति का नाम');
  });

  it('falls back to part/assembly address when street/locality fields are omitted', () => {
    const minimalAddressPayload = {
      ...sampleApiResponse,
      data: {
        ...sampleApiResponse.data,
        localityStreet: '',
        townVillage: '',
        tehsil: '',
        localityStreetL1: '',
        townVillageL1: '',
        tehsilL1: '',
      },
    };

    const card = normalizeWebApiInVoter(minimalAddressPayload, 'TMV0654962');
    expect(card.fullAddress).toBe(
      'MASTER MAIND PUBLIC SCHOOL ROOM NO.2, Unnao, Uttar Pradesh'
    );
    expect(card.fullAddressRegional).toBe(
      'मास्टर माइंड पब्लिक स्कूल कक्ष सं0-२, उन्नाव, उत्तर प्रदेश'
    );
  });

  it('handles numeric age safely without throwing on type variance', () => {
    const numAgePayload = {
      ...sampleApiResponse,
      data: {
        ...sampleApiResponse.data,
        age: 34,
      },
    };

    const card = normalizeWebApiInVoter(numAgePayload, 'TMV0654962');
    expect(card.age).toBe('34');
  });
});
