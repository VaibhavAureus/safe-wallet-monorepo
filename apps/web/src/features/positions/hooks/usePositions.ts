import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'
import { usePositionsGetPositionsV1Query, type Protocol } from '@safe-global/store/gateway/AUTO_GENERATED/positions'
import { selectPositions } from '@/store/balancesSlice'
import type { AppBalance } from '@safe-global/store/gateway/AUTO_GENERATED/portfolios'
import useIsPositionsFeatureEnabled from './useIsPositionsFeatureEnabled'
import { useMemo } from 'react'
import { FEATURES, hasFeature } from '@safe-global/utils/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'

const POLLING_INTERVAL = 300_000 // 5 minutes

const transformProtocolsToAppBalances = (protocols?: Protocol[]): AppBalance[] | undefined => {
  if (!protocols) return undefined

  return protocols.map((protocol) => ({
    appInfo: {
      name: protocol.protocol_metadata.name,
      logoUrl: protocol.protocol_metadata.icon.url,
      url: null,
    },
    balanceFiat: protocol.fiatTotal,
    groups: protocol.items.map((group) => ({
      name: group.name,
      items: group.items.map((position) => ({
        key: `${protocol.protocol}-${position.tokenInfo.address}`,
        type: position.position_type || 'unknown',
        name: position.tokenInfo.name,
        tokenInfo: {
          address: position.tokenInfo.address,
          decimals: position.tokenInfo.decimals,
          logoUri: position.tokenInfo.logoUri || '',
          name: position.tokenInfo.name,
          symbol: position.tokenInfo.symbol,
          trusted: true,
          chainId: '',
          type: position.tokenInfo.type,
        } as AppBalance['groups'][0]['items'][0]['tokenInfo'],
        receiptTokenAddress: null,
        balance: position.balance,
        balanceFiat: position.fiatBalance,
        priceChangePercentage1d: position.fiatBalance24hChange,
      })),
    })),
  }))
}

const usePositions = () => {
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()
  const currency = useAppSelector(selectCurrency)
  const isPositionsEnabled = useIsPositionsFeatureEnabled()
  const chain = useCurrentChain()

  const isPortfolioEndpointEnabled = useMemo(
    () => (chain ? hasFeature(chain, FEATURES.PORTFOLIO_ENDPOINT) : false),
    [chain],
  )

  const shouldUsePortfolioEndpoint = isPositionsEnabled && isPortfolioEndpointEnabled
  const shouldUsePositionEndpoint = isPositionsEnabled && !isPortfolioEndpointEnabled

  const { currentData, error, isLoading } = usePositionsGetPositionsV1Query(
    { chainId, safeAddress, fiatCode: currency },
    {
      skip: !shouldUsePositionEndpoint || !safeAddress || !chainId || !currency,
      pollingInterval: POLLING_INTERVAL,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
    },
  )

  const portfolioPositions = useAppSelector(selectPositions)

  const transformedLegacyPositions = useMemo(() => transformProtocolsToAppBalances(currentData), [currentData])

  const resultData = useMemo(
    () => (shouldUsePortfolioEndpoint ? portfolioPositions : transformedLegacyPositions),
    [shouldUsePortfolioEndpoint, portfolioPositions, transformedLegacyPositions],
  )

  return useMemo(
    () => ({
      data: resultData,
      error,
      isLoading,
    }),
    [resultData, error, isLoading],
  )
}

export default usePositions
