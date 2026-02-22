import { IonAlert } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import normalizeUrl from 'normalize-url';
import { useState } from 'react';
import { useIntl } from 'react-intl';

export const safeNormalizeUrl = (value: string): string | null => {
  try {
    return normalizeUrl(value, {
      defaultProtocol: 'https',
      forceHttps: true,
    });
  } catch {
    return null;
  }
};

type ExternalLinkProps = {
  value: string;
};

export const ExternalLink = ({ value }: ExternalLinkProps) => {
  const intl = useIntl();
  const [showConfirm, setShowConfirm] = useState(false);

  const url = safeNormalizeUrl(value);

  const openLink = async () => {
    if (!url) return;

    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!url) {
    return value;
  }

  return (
    <>
        <a
          href={url}
          onClick={(e) => {
            e.preventDefault();
            setShowConfirm(true);
          }}
        >
          {value}
        </a>

      <IonAlert
        isOpen={showConfirm}
        header={intl.formatMessage({
          id: 'components.externalLink.header',
        })}
        message={intl.formatMessage({
          id: 'components.externalLink.message',
        })}
        buttons={[
          {
            text: intl.formatMessage({
              id: 'buttons.label.cancel',
            }),
            role: 'cancel',
            handler: () => setShowConfirm(false),
          },
          {
            text: intl.formatMessage({
              id: 'components.externalLink.open',
            }),
            handler: async () => {
              setShowConfirm(false);
              await openLink();
            },
          },
        ]}
        onDidDismiss={() => setShowConfirm(false)}
      />
    </>
  );
};
