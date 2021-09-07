import {AvatarProps} from '@material-ui/core/Avatar';

enum CustomAvatarSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

interface CustomAvatarProps {
  avatar: string;
  size?: CustomAvatarSize;
  variant?: AvatarProps['variant'];
}

export {CustomAvatarSize};
export type {CustomAvatarProps};