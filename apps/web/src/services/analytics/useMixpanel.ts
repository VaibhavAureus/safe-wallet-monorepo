import { useEffect, useMemo, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  mixpanelInit,
  mixpanelSetBlockchainNetwork,
  mixpanelSetDeviceType,
  mixpanelSetSafeAddress,
  mixpanelSetUserProperties,
  mixpanelIdentify,
  mixpanelSetEOAWalletLabel,
  mixpanelSetEOAWalletAddress,
  mixpanelSetEOAWalletNetwork,
  mixpanelOptInTracking,
  mixpanelOptOutTracking,
} from './mixpanel'
import { useAppSelector } from '@/store'
import { CookieAndTermType, hasConsentFor } from '@/store/cookiesAndTermsSlice'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { IS_PRODUCTION } from '@/config/constants'
import { useMediaQuery } from '@mui/material'
import { DeviceType } from './types'
import { MixpanelUserProperty } from './mixpanel-events'
import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import { useIsSpaceRoute } from '@/hooks/useIsSpaceRoute'
import { useMixpanelUserProperties } from './useMixpanelUserProperties'
import { useChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'

const useMixpanel = () => {
  const isMixpanelEnabled = useHasFeature(FEATURES.MIXPANEL)
  const isAnalyticsEnabled = useAppSelector((state) => hasConsentFor(state, CookieAndTermType.ANALYTICS))
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const deviceType = useMemo(() => {
    return isMobile ? DeviceType.MOBILE : isTablet ? DeviceType.TABLET : DeviceType.DESKTOP
  }, [isMobile, isTablet])
  const safeAddress = useSafeAddress()
  const wallet = useWallet()
  const isSpaceRoute = useIsSpaceRoute()
  const userProperties = useMixpanelUserProperties()
  const { safe } = useSafeInfo()
  const currentChain = useChain(safe?.chainId || '')
  const walletChain = useChain(wallet?.chainId || '')
  const lastUserPropertiesRef = useRef<string | null>(null)

  useEffect(() => {
    if (isMixpanelEnabled) {
      mixpanelInit()
    }
  }, [isMixpanelEnabled])

  useEffect(() => {
    if (!isMixpanelEnabled) return

    try {
      if (isAnalyticsEnabled) {
        if (mixpanel && typeof mixpanel.opt_in_tracking === 'function') {
          mixpanel.opt_in_tracking()
          if (!IS_PRODUCTION) {
            console.info('[Mixpanel] - User opted in')
          }
        }
      } else {
        if (mixpanel && typeof mixpanel.opt_out_tracking === 'function') {
          mixpanel.opt_out_tracking()
        }
        if (!IS_PRODUCTION) {
          console.info('[Mixpanel] - User opted out')
        }
      }
    } catch (error) {
      // Silently fail if Mixpanel is not initialized
      if (!IS_PRODUCTION) {
        console.warn('[Mixpanel] - Failed to set tracking preference:', error)
      }
    }
  }, [isMixpanelEnabled, isAnalyticsEnabled])

  useEffect(() => {
    if (currentChain) {
      mixpanelSetBlockchainNetwork(currentChain.chainName)
    }
  }, [currentChain])

  useEffect(() => {
    mixpanelSetDeviceType(deviceType)
  }, [deviceType])

  useEffect(() => {
    mixpanelSetSafeAddress(safeAddress)

    if (safeAddress && !isSpaceRoute) {
      mixpanelIdentify(safeAddress)
    }
  }, [safeAddress, isSpaceRoute])

  useEffect(() => {
    if (wallet) {
      const walletProperties: Record<string, any> = {}

      if (wallet.label) {
        walletProperties[MixpanelUserProperty.WALLET_LABEL] = wallet.label
      }
      if (wallet.address) {
        walletProperties[MixpanelUserProperty.WALLET_ADDRESS] = wallet.address
      }

      if (Object.keys(walletProperties).length > 0) {
        mixpanelSetUserProperties(walletProperties)
      }

      if (wallet.label) {
        mixpanelSetEOAWalletLabel(wallet.label)
      }
      if (wallet.address) {
        mixpanelSetEOAWalletAddress(wallet.address)
      }
      if (walletChain) {
        mixpanelSetEOAWalletNetwork(walletChain.chainName)
      }
    } else {
      mixpanelSetEOAWalletLabel('')
      mixpanelSetEOAWalletAddress('')
      mixpanelSetEOAWalletNetwork('')
    }
  }, [wallet, walletChain])

  useEffect(() => {
    if (!userProperties) return

    // Deep comparison to prevent infinite loop from object reference changes
    const currentPropertiesStr = JSON.stringify(userProperties.properties)

    if (lastUserPropertiesRef.current !== currentPropertiesStr) {
      lastUserPropertiesRef.current = currentPropertiesStr
      mixpanelSetUserProperties(userProperties.properties)
    }
  }, [userProperties])
}

export default useMixpanel
