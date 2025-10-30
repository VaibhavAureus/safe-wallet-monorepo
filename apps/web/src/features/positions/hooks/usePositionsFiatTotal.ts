import usePositions from '@/features/positions/hooks/usePositions'

const usePositionsFiatTotal = () => {
  const { data: appBalances } = usePositions()

  if (!appBalances) return 0

  return appBalances.reduce((acc, appBalance) => acc + parseFloat(appBalance.balanceFiat || '0'), 0)
}

export default usePositionsFiatTotal
