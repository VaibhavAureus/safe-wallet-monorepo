import { Accordion, AccordionDetails, AccordionSummary, Box, Card, Stack, Typography } from '@mui/material'
import PositionsHeader from '@/features/positions/components/PositionsHeader'
import EnhancedTable from '@/components/common/EnhancedTable'
import FiatValue from '@/components/common/FiatValue'
import { formatVisualAmount } from '@safe-global/utils/utils/formatters'
import { getReadablePositionType } from '@/features/positions/utils'
import TokenIcon from '@/components/common/TokenIcon'
import { FiatChange } from '@/components/balances/AssetsTable/FiatChange'
import usePositions from '@/features/positions/hooks/usePositions'
import PositionsEmpty from '@/features/positions/components/PositionsEmpty'
import usePositionsFiatTotal from '@/features/positions/hooks/usePositionsFiatTotal'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import React from 'react'
import PositionsUnavailable from './components/PositionsUnavailable'
import TotalAssetValue from '@/components/balances/TotalAssetValue'
import PositionsSkeleton from '@/features/positions/components/PositionsSkeleton'

export const Positions = () => {
  const positionsFiatTotal = usePositionsFiatTotal()
  const { data: appBalances, error, isLoading } = usePositions()

  if (isLoading || (!error && !appBalances)) {
    return <PositionsSkeleton />
  }

  if (error || !appBalances) return <PositionsUnavailable hasError={!!error} />

  if (appBalances.length === 0) {
    return <PositionsEmpty entryPoint="Positions" />
  }

  return (
    <Stack gap={2}>
      <Box>
        <Box mb={2}>
          <TotalAssetValue fiatTotal={positionsFiatTotal} title="Total positions value" />
        </Box>

        <Typography variant="h4" fontWeight={700}>
          Positions
        </Typography>

        <Box mb={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Position balances are not included in the total asset value.
          </Typography>
        </Box>
      </Box>

      {appBalances.map((appBalance) => {
        return (
          <Card key={appBalance.appInfo.name} sx={{ border: 0 }}>
            <Accordion disableGutters elevation={0} variant="elevation" defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{ justifyContent: 'center', overflowX: 'auto', backgroundColor: 'transparent !important' }}
              >
                <PositionsHeader appBalance={appBalance} fiatTotal={positionsFiatTotal} />
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 0 }}>
                {(() => {
                  // Iterate through groups and create tables for each group
                  const groupTables = appBalance.groups.map((group, groupIndex) => {
                    const rows = group.items.map((position) => ({
                      cells: {
                        name: {
                          content: (
                            <Stack direction="row" alignItems="center" gap={1}>
                              <TokenIcon
                                logoUri={position.tokenInfo.logoUri}
                                tokenSymbol={position.tokenInfo.symbol}
                                size={32}
                              />

                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {position.tokenInfo.name}
                                </Typography>
                                <Typography variant="body2" color="primary.light">
                                  {position.tokenInfo.symbol} •&nbsp; {getReadablePositionType(position.type)}
                                </Typography>
                              </Box>
                            </Stack>
                          ),
                          rawValue: 'Test',
                        },
                        balance: {
                          content: (
                            <Typography textAlign="right">
                              {formatVisualAmount(position.balance, position.tokenInfo.decimals)}{' '}
                              {position.tokenInfo.symbol}
                            </Typography>
                          ),
                          rawValue: position.balance,
                        },
                        value: {
                          content: (
                            <Box textAlign="right">
                              <Typography>
                                <FiatValue value={position.balanceFiat || '0'} />
                              </Typography>
                              <Typography variant="caption">
                                <FiatChange
                                  balanceItem={{
                                    balance: '0',
                                    fiatBalance: '0',
                                    fiatConversion: '0',
                                    tokenInfo: {
                                      address: '',
                                      decimals: 0,
                                      logoUri: '',
                                      name: '',
                                      symbol: '',
                                      type: 'ERC20' as const,
                                    },
                                    fiatBalance24hChange: position.priceChangePercentage1d || null,
                                  }}
                                  inline
                                />
                              </Typography>
                            </Box>
                          ),
                          rawValue: position.balanceFiat || '0',
                        },
                      },
                    }))

                    const headCells = [
                      {
                        id: 'name',
                        label: (
                          <Typography variant="body2" fontWeight="bold" color="text.primary">
                            {group.name}
                          </Typography>
                        ),
                        width: '25%',
                        disableSort: true,
                      },
                      { id: 'balance', label: 'Balance', width: '35%', align: 'right', disableSort: true },
                      { id: 'value', label: 'Value', width: '40%', align: 'right', disableSort: true },
                    ]

                    return (
                      <Box key={groupIndex} sx={{ mb: groupIndex < appBalance.groups.length - 1 ? 2 : 0 }}>
                        <EnhancedTable rows={rows} headCells={headCells} compact />
                      </Box>
                    )
                  })

                  return <Box>{groupTables}</Box>
                })()}
              </AccordionDetails>
            </Accordion>
          </Card>
        )
      })}
    </Stack>
  )
}

export default Positions
