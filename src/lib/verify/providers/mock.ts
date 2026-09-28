import { DocumentType, PanCardData, VoterCardData, DlCardData, RcCardData, AadhaarCardData } from '@/types/cards';
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
          careOf: 'S/O: BHUPENDRA PATEL',
          careOfRegional: 'आत्मज: भूपेन्द्र पटेल',
          address: '104, SHIVAM COMPLEX, DRIVE IN ROAD, NAVRANGPURA, AHMEDABAD, GUJARAT - 380009',
          addressRegional: '१०४, शिवम कॉम्प्लेक्स, ड्राइव इन रोड, नवरंगपुरा, अहमदाबाद, गुजरात - ३८०००९',
        } satisfies Partial<AadhaarCardData>;
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
