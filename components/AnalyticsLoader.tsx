"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT, type ConsentValue } from "@/components/CookieConsent";

interface AnalyticsLoaderProps {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  smartlookProjectKey?: string;
}

export default function AnalyticsLoader({
  googleAnalyticsId,
  facebookPixelId,
  smartlookProjectKey,
}: AnalyticsLoaderProps) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentValue | null;
    if (stored) setConsent(stored);

    const handler = (e: Event) => {
      setConsent((e as CustomEvent<ConsentValue>).detail);
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, handler);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
  }, []);

  if (consent !== "accepted") return null;

  return (
    <>
      {googleAnalyticsId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {facebookPixelId && (
        <Script id="fb-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {smartlookProjectKey && (
        <Script id="smartlook-init" strategy="afterInteractive">
          {`
            window.smartlook||(function(d) {
              var o=smartlook=function(){o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
              var c=d.createElement('script');o.api=new Array();c.async=true;
              c.type='text/javascript';c.charset='utf-8';c.src='https://web-sdk.smartlook.com/recorder.js';
              h.appendChild(c);
            })(document);
            smartlook('init', '${smartlookProjectKey}', { region: 'eu' });
          `}
        </Script>
      )}
    </>
  );
}
