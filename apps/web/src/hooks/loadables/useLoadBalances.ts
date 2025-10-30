import { useMemo } from 'react'
import { type Balances, useBalancesGetBalancesV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/balances'
import {
  usePortfolioGetPortfolioV1Query,
  type Portfolio,
  type AppBalance,
} from '@safe-global/store/gateway/AUTO_GENERATED/portfolios'
import { useAppSelector } from '@/store'
import { selectCurrency, selectSettings, TOKEN_LISTS } from '@/store/settingsSlice'
import { useCurrentChain } from '../useChains'
import useSafeInfo from '../useSafeInfo'
import { POLLING_INTERVAL } from '@/config/constants'
import { useCounterfactualBalances } from '@/features/counterfactual/useCounterfactualBalances'
import { FEATURES, hasFeature } from '@safe-global/utils/utils/chains'
import type { AsyncResult } from '@safe-global/utils/hooks/useAsync'

const transformPortfolioToBalances = (portfolio?: Portfolio): PortfolioBalances | undefined => {
  if (!portfolio) return undefined

  return {
    items: portfolio.tokenBalances.map((token) => ({
      tokenInfo: {
        ...token.tokenInfo,
        logoUri: token.tokenInfo.logoUri || '',
      },
      balance: token.balance,
      fiatBalance: token.balanceFiat || '0',
      fiatConversion: token.price || '0',
      fiatBalance24hChange: token.priceChangePercentage1d,
    })),
    fiatTotal: portfolio.totalBalanceFiat,
    tokensFiatTotal: portfolio.totalTokenBalanceFiat,
    positionsFiatTotal: portfolio.totalPositionsBalanceFiat,
    positions: portfolio.positionBalances,
  }
}

export const useTokenListSetting = (): boolean | undefined => {
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)

  const isTrustedTokenList = useMemo(() => {
    if (settings.tokenList === TOKEN_LISTS.ALL) return false
    return chain ? hasFeature(chain, FEATURES.DEFAULT_TOKENLIST) : undefined
  }, [chain, settings.tokenList])

  return isTrustedTokenList
}

export interface PortfolioBalances extends Balances {
  positions?: AppBalance[]
  tokensFiatTotal?: string
  positionsFiatTotal?: string
}

const useLoadBalances = (): AsyncResult<PortfolioBalances> => {
  const currency = useAppSelector(selectCurrency)
  const isTrustedTokenList = useTokenListSetting()
  const { safe, safeAddress } = useSafeInfo()
  const chain = useCurrentChain()
  const isReady = safeAddress && safe.deployed && isTrustedTokenList !== undefined
  const isCounterfactual = !safe.deployed

  const shouldUsePortfolioEndpoint = useMemo(
    () => (chain ? hasFeature(chain, FEATURES.PORTFOLIO_ENDPOINT) : false),
    [chain],
  )

  let balances: PortfolioBalances | undefined
  let loading: boolean
  let errorStr: any

  const {
    currentData: legacyBalances,
    isLoading: legacyLoading,
    error: legacyError,
  } = useBalancesGetBalancesV1Query(
    {
      chainId: safe.chainId,
      safeAddress,
      fiatCode: currency,
      trusted: isTrustedTokenList,
    },
    {
      skip: !isReady || shouldUsePortfolioEndpoint,
      pollingInterval: POLLING_INTERVAL,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
    },
  )

  balances = legacyBalances
  loading = legacyLoading
  errorStr = legacyError

  const {
    currentData: portfolioData,
    isLoading: portfolioLoading,
    error: portfolioError,
  } = usePortfolioGetPortfolioV1Query(
    {
      address: safeAddress,
      chainIds: safe.chainId,
      fiatCode: currency,
      trusted: isTrustedTokenList,
    },
    {
      skip: !shouldUsePortfolioEndpoint || !isReady,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
    },
  )

  const memoizedPortfolioBalances = useMemo(() => transformPortfolioToBalances(portfolioData), [portfolioData])

  if (shouldUsePortfolioEndpoint) {
    balances = memoizedPortfolioBalances
    loading = portfolioLoading
    errorStr = portfolioError
  } else if (balances) {
    balances = {
      ...balances,
      tokensFiatTotal: balances.fiatTotal,
      positionsFiatTotal: '0',
      positions: undefined,
    } as PortfolioBalances
  }

  // Counterfactual balances
  const [cfData, cfError, cfLoading] = useCounterfactualBalances(safe)

  let error = useMemo(() => (errorStr ? new Error(errorStr.toString()) : undefined), [errorStr])

  if (isCounterfactual) {
    const cfBalances = cfData as unknown as Balances
    balances = {
      ...cfBalances,
      tokensFiatTotal: cfBalances?.fiatTotal,
      positionsFiatTotal: '0',
      positions: undefined,
    } as PortfolioBalances
    loading = cfLoading
    error = cfError
  }

  const result = useMemo<AsyncResult<PortfolioBalances>>(() => {
    return [balances, error, loading]
  }, [balances, error, loading])

  return result
}

export default useLoadBalances
