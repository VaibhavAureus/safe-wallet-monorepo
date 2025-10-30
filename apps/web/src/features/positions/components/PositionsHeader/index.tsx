import { Chip, Stack, Tooltip, Typography } from '@mui/material'
import TokenIcon from '@/components/common/TokenIcon'
import FiatValue from '@/components/common/FiatValue'
import { formatPercentage } from '@safe-global/utils/utils/formatters'
import type { AppBalance } from '@safe-global/store/gateway/AUTO_GENERATED/portfolios'
import { Box } from '@mui/system'

const PositionsHeader = ({ appBalance, fiatTotal }: { appBalance: AppBalance; fiatTotal?: number }) => {
  const shareOfFiatTotal = fiatTotal ? formatPercentage(parseFloat(appBalance.balanceFiat) / fiatTotal) : null

  return (
    <>
      <Stack direction="row" gap={1} alignItems="center" width={1}>
        <Box sx={{ borderRadius: '50%', overflow: 'hidden', display: 'flex' }}>
          <TokenIcon
            logoUri={appBalance.appInfo.logoUrl || undefined}
            tokenSymbol={appBalance.appInfo.name}
            size={32}
          />
        </Box>

        <Typography fontWeight="bold" ml={0.5}>
          {appBalance.appInfo.name}
        </Typography>

        {shareOfFiatTotal && (
          <Tooltip title="Based on total positions value" placement="top" arrow>
            <Chip
              variant="filled"
              size="tiny"
              label={shareOfFiatTotal}
              sx={{
                backgroundColor: 'background.lightGrey',
                color: 'text.primary',
                borderRadius: 'var(--15-x, 6px)',
                '& .MuiChip-label': {
                  letterSpacing: '1px',
                },
              }}
            />
          </Tooltip>
        )}

        <Typography fontWeight="bold" mr={1} ml="auto" justifySelf="flex-end">
          <FiatValue value={appBalance.balanceFiat} maxLength={20} precise />
        </Typography>
      </Stack>
    </>
  )
}

export default PositionsHeader
