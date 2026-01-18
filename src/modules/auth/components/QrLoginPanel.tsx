import { m } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'

import { Spring } from '~/lib/spring'

export const QrLoginPanel = () => {
  // QR contains URL to /start - farmer scans and goes directly to labeling
  const qrUrl = `${window.location.origin}/start`

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center space-y-6">
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={Spring.presets.smooth}
        className="space-y-4 text-center"
      >
        <m.div
          whileHover={{ scale: 1.02 }}
          transition={Spring.presets.snappy}
        >
          <div className="mx-auto w-fit rounded-xl border border-border bg-white p-2">
            <QRCodeSVG
              value={qrUrl}
              size={200}
              level="H"
              includeMargin={true}
              className="rounded-lg"
            />
          </div>
        </m.div>
        <div className="space-y-1">
          <h3 className="font-semibold text-text">Scan to Start Labeling</h3>
          <p className="text-sm text-text-secondary">
            Use your phone camera to scan and start labeling instantly.
          </p>
        </div>
      </m.div>
    </div>
  )
}
