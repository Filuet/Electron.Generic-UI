import { ProductDataModal } from './modal';

export interface ImageUtilsProps {
  skuCode: string;
  imgHeight?: string;
  containerHeight: string;
  containerWidth: string;
}
export interface ProductPageProps {
  searchText: string;
}

export interface ProductCartPageProps {
  onCheckoutPageClose?: () => void;
  productSuggestionList: ProductDataModal[];
}

export interface OriflameLoaderProp {
  isLoading: boolean;
  message?: string;
}
export interface UserWelcomePageProps {
  phoneNumber: string;
}
export interface ValidateOtpProps {
  phoneNumber: string;
}

export interface OriflameModalProps {
  isModalOpen: boolean;
  onCloseModal?: () => void;
  content: string;
}
