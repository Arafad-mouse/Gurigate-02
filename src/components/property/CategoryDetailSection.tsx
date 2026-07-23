import type { LandingProperty } from '@/data/landingProperties';
import type { ResidentialDetails, CommercialDetails, LandDetails, HospitalityDetails } from '@/types/propertyDetails';
import { ResidentialDetails as ResidentialDetailsComponent } from './ResidentialDetails';
import { CommercialDetails as CommercialDetailsComponent } from './CommercialDetails';
import { LandDetails as LandDetailsComponent } from './LandDetails';
import { HospitalityDetails as HospitalityDetailsComponent } from './HospitalityDetails';

interface Props {
  property: LandingProperty;
}

export function CategoryDetailSection({ property }: Props) {
  if (!property.category || !property.categoryDetails) {
    return null;
  }

  const renderDetails = () => {
    switch (property.category) {
      case 'residential':
        return (
          <ResidentialDetailsComponent 
            details={property.categoryDetails as ResidentialDetails} 
          />
        );
      case 'commercial':
        return (
          <CommercialDetailsComponent 
            details={property.categoryDetails as CommercialDetails} 
          />
        );
      case 'land':
        return (
          <LandDetailsComponent 
            details={property.categoryDetails as LandDetails} 
          />
        );
      case 'hospitality':
        return (
          <HospitalityDetailsComponent 
            details={property.categoryDetails as HospitalityDetails} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      {renderDetails()}
    </div>
  );
}
