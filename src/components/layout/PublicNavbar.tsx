'use client';

import React from 'react';
import PublicHeader, { PublicHeaderProps } from '@/components/public/PublicHeader';

export type PublicNavbarProps = PublicHeaderProps;

export default function PublicNavbar(props: PublicNavbarProps) {
  return <PublicHeader {...props} />;
}
