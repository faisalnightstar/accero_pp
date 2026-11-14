import { DocumentType, PanCardData, VoterCardData, DlCardData, RcCardData, AadhaarCardData, FarmerCardData, formatFarmerId } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from '../types';

export class MockProvider implements ProviderAdapter {
  name = 'MockSimulation';

  supports(_docType: DocumentType): boolean {
    return true;
  }

  async lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult> {
    const startTime = Date.now();
    // Simulate brief network latency (250-400ms)
    await new Promise((resolve) => setTimeout(resolve, 300));
    const upperId = idNumber.toUpperCase().trim();

    let data: Record<string, any> = {};

    switch (docType) {
      case 'pan':
        data = {
          panNumber: upperId,
          fullName: 'RAJESH KUMAR SHARMA',
          fatherName: 'SURESH CHAND SHARMA',
          dateOfBirth: '15/08/1988',
          category: 'Individual',
          qrData: `PAN:${upperId}|NAME:RAJESH KUMAR SHARMA|FNAME:SURESH CHAND SHARMA|DOB:15/08/1988`,
        } satisfies Partial<PanCardData>;
        break;

      case 'voter':
        data = {
          epicNumber: upperId,
          electorName: 'ANITA VERMA',
          electorNameRegional: 'अनिता वर्मा',
          relationType: 'HUSBAND',
          relationName: 'MANOJ VERMA',
          relationNameRegional: 'मनोज वर्मा',
          gender: 'Female',
          genderRegional: 'महिला',
          age: '34',
          dateOfBirth: '10/04/1990',
          assemblyConstituency: '54 - GHAZIABAD',
          assemblyConstituencyRegional: '54 - गाज़ियाबाद',
          partNumberAndName: '142 - KAVI NAGAR COMMUNITY HALL',
          partNumberAndNameRegional: '142 - कवि नगर कम्युनिटी हॉल',
          district: 'GHAZIABAD',
          districtRegional: 'गाज़ियाबाद',
          state: 'UTTAR PRADESH',
          stateRegional: 'उत्तर प्रदेश',
          fullAddress: 'H NO 42, SECTOR 11, KAVI NAGAR, GHAZIABAD, UTTAR PRADESH - 201002',
          fullAddressRegional: 'मकान न. 42, सेक्टर 11, कवि नगर, गाज़ियाबाद, उत्तर प्रदेश - 201002',
        } satisfies Partial<VoterCardData>;
        break;

      case 'dl':
        data = {
          dlNumber: upperId,
          holderName: 'VIKRAM SINGH CHAUHAN',
          fatherOrHusbandName: 'HARISH SINGH CHAUHAN',
          dateOfBirth: '22-07-1992',
          bloodGroup: 'B+',
          address: 'FLAT 302, SUNSHINE APARTMENTS, R.K. PURAM, NEW DELHI - 110022',
          issueDate: '14-03-2015',
          validityNonTransport: '21-07-2032',
          validityTransport: '13-03-2025',
          issuingAuthority: 'RTO SOUTH WEST DELHI (DL-03)',
          vehicleClasses: [
            { code: 'MCWG', desc: 'Motor Cycle With Gear', issueDate: '14-03-2015' },
            { code: 'LMV', desc: 'Light Motor Vehicle', issueDate: '14-03-2015' },
          ],
        } satisfies Partial<DlCardData>;
        break;

      case 'rc':
        data = {
          registrationNumber: upperId,
          registrationDate: '05/11/2021',
          chassisNumber: 'ME4JF504MKC0' + upperId.slice(-4),
          engineNumber: 'JF50E72' + upperId.slice(-4),
          ownerName: 'PRIYA SUNDARAM',
          sonWifeDaughterOf: 'W/O ARUN SUNDARAM',
          address: 'B-12, NEELAM PALACE, INDIRAPURAM, GHAZIABAD, UP - 201014',
          vehicleClass: 'MOTOR CAR (LMV)',
          makerModel: 'HYUNDAI MOTOR INDIA / CRETA 1.5 SX',
          fuelType: 'PETROL',
          emissionNorm: 'BHARAT STAGE VI',
          seatingCapacity: 5,
          color: 'POLAR WHITE',
          hypothecatedTo: 'HDFC BANK LTD',
          fitnessValidUpto: '04/11/2036',
          taxPaidUpto: 'L.T.T.',
          insuranceValidUpto: '03/11/2025',
          issuingAuthority: 'ARTO GHAZIABAD (UP14)',
        } satisfies Partial<RcCardData>;
        break;

      case 'aadhaar':
        data = {
          aadhaarNumber: upperId.length === 12 ? upperId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : upperId,
          name: 'AMIT PATEL',
          nameRegional: 'अमित पटेल',
          dateOfBirth: '01/01/1985',
          gender: 'MALE',
          genderRegional: 'पुरुष',
          careOf: 'S/O BHUPENDRA PATEL',
          careOfRegional: 'आत्मज भूपेन्द्र पटेल',
          address: '104, SHIVAM COMPLEX, DRIVE IN ROAD, NAVRANGPURA, AHMEDABAD, GUJARAT - 380009',
          addressRegional: '१०४, शिवम कॉम्प्लेक्स, ड्राइव इन रोड, नवरंगपुरा, अहमदाबाद, गुजरात - ३८०००९',
        } satisfies Partial<AadhaarCardData>;
        break;

      case 'farmer':
        data = {
          farmerId: upperId.length === 11 || upperId.length === 12 ? formatFarmerId(upperId) : upperId,
          farmerName: 'MOHAN SINGH',
          farmerNameRegional: 'मोहन सिंह',
          gender: 'Male',
          genderRegional: 'पुरुष',
          dateOfBirth: '01/01/1981',
          caste: '',
          areaCategory: 'Rural',
          aadhaarNumber: '411921789250',
          approvalDate: '15/06/2025',
          downloadDate: '15/06/2025',
          registryTitle: 'राजस्थान फार्मर रजिस्ट्री',
          departmentHeaderRegional: 'भारत सरकार',
          departmentTitleRegional: 'भारत सरकार',
          departmentTitleEnglish: 'Government of India',
          ministryHeaderRegional: 'कृषि एवं किसान कल्याण मंत्रालय',
          ministryTitleEnglish: 'Ministry of Agri & Farmers Welfare',
          address: {
            fatherOrSpouseName: 'S/O: Keshariya',
            locality: 'jatav muhalla',
            village: 'Dahwa',
            district: 'Bharatpur',
            state: 'Rajasthan',
            pinCode: '321201',
            fullAddress: 'S/O: Keshariya, jatav muhalla, house no., Dahwa, Bharatpur, Rajasthan - 321201',
          },
          landRecords: [
            { khata: '10', khasra: '218', area: '0.000833' },
            { khata: '10', khasra: '235', area: '0.010833' },
            { khata: '11', khasra: '32', area: '0.022917' },
            { khata: '10', khasra: '196', area: '0.023333' },
            { khata: '10', khasra: '220', area: '0.024583' },
            { khata: '11', khasra: '33', area: '0.025' },
          ],
        } satisfies Partial<FarmerCardData>;
        break;

      case 'farmer':
        data = {
          farmerId: upperId.length === 11 || upperId.length === 12 ? formatFarmerId(upperId) : upperId,
          farmerName: 'MOHAN SINGH',
          farmerNameRegional: 'मोहन सिंह',
          gender: 'पुरुष / Male',
          dateOfBirth: '01/01/1981',
          caste: '',
          areaCategory: 'Rural',
          aadhaarNumber: '411921789250',
          approvalDate: '15/06/2025',
          downloadDate: '15/06/2025',
          registryTitle: 'Rajasthan Farmer Registry',
          departmentTitleHindi: 'भारत सरकार',
          departmentTitleEnglish: 'Government of India',
          address: {
            fatherOrSpouseName: 'S/O: Keshariya',
            locality: 'jatav muhalla',
            village: 'Dahwa',
            district: 'Bharatpur',
            state: 'Rajasthan',
            pinCode: '321201',
            fullAddress: 'S/O: Keshariya, jatav muhalla, house no., Dahwa, Bharatpur, Rajasthan - 321201',
          },
          landRecords: [
            { khata: '10', khasra: '218', area: '0.000833' },
            { khata: '10', khasra: '235', area: '0.010833' },
            { khata: '11', khasra: '32', area: '0.022917' },
            { khata: '10', khasra: '196', area: '0.023333' },
            { khata: '10', khasra: '220', area: '0.024583' },
            { khata: '11', khasra: '33', area: '0.025' },
          ],
        } satisfies Partial<FarmerCardData>;
        break;
    }

    return {
      success: true,
      documentType: docType,
      idNumber: upperId,
      data,
      provider: this.name,
      isPartial: false,
      latencyMs: Date.now() - startTime,
    };
  }
}
