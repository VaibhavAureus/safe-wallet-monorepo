import { Accordion, AccordionDetails, AccordionSummary, Box, Card, Stack, Typography } from '@mui/material'
import PositionsHeader from '@/features/positions/components/PositionsHeader'
import { PositionGroup } from '@/features/positions/components/PositionGroup'
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
                {appBalance.groups.map((group, groupIndex) => (
                  <PositionGroup key={groupIndex} group={group} isLast={groupIndex === appBalance.groups.length - 1} />
                ))}
              </AccordionDetails>
            </Accordion>
          </Card>
        )
      })}
    </Stack>
  )
}

export default Positions
