import { ImgHTMLAttributes } from 'react';

/*
 * TanganakDusun application logo image component
 */
export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/images/tgkdsn-logo.png"
            alt="TanganakDusun Logo"
        />
    );
}
