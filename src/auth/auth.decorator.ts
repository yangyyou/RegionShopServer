import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from 'src/common/common';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
