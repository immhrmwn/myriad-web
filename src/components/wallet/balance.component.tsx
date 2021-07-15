import React, { useState, useEffect, useImperativeHandle } from 'react';

import { useSession } from 'next-auth/client';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';

import { useStyles, TableCell, StyledBadge } from './balance.style';

import { usePolkadotApi } from 'src/hooks/use-polkadot-api.hook';
import { Token } from 'src/interfaces/token';

interface BalanceProps {
  forwardedRef: React.ForwardedRef<any>;
  availableTokens: Token[];
}

const BalanceComponent: React.FC<BalanceProps> = ({ forwardedRef, availableTokens }) => {
  const style = useStyles();

  const [session] = useSession();
  const userAddress = session?.user.address as string;

  const { loading, error, tokensReady, load } = usePolkadotApi();

  useEffect(() => {
    load(userAddress, availableTokens);
  }, []);

  useImperativeHandle(forwardedRef, () => ({
    triggerRefresh: () => {
      setIsHidden(false);
      load(userAddress, availableTokens);
    }
  }));

  const [isHidden, setIsHidden] = useState(true);
  const handleIsHidden = () => {
    setIsHidden(!isHidden);
  };

  const TooltipContent = () => {
    return (
      <div className={style.tooltipContentRoot}>
        <Typography className={style.tooltipContentHeader}>Myria</Typography>{' '}
        <Typography>A reward token you earn by sending a tip to a post you think is valuable.</Typography>
      </div>
    );
  };

  const StyledTooltip = () => {
    return (
      <Tooltip title={<TooltipContent />} placement="right" aria-label="myria-token-info">
        <InfoIcon fontSize="small" />
      </Tooltip>
    );
  };

  const CurrencyTable = () => {
    return (
      <TableContainer>
        <Table size="small" aria-label="balance-table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography className={style.balanceText}>Currency</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography className={style.balanceText}>Balance</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokensReady.map(row => (
              <TableRow key={row.tokenSymbol}>
                <TableCell component="th" scope="row">
                  <Typography className={style.balanceText}>
                    {row.tokenSymbol === 'MYR' ? (
                      <StyledBadge badgeContent={<StyledTooltip />}>{row.tokenSymbol}</StyledBadge>
                    ) : (
                      row.tokenSymbol
                    )}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {isHidden ? (
                    <Button onClick={handleIsHidden}>Show balance</Button>
                  ) : loading ? (
                    <CircularProgress className={style.spinner} size={20} />
                  ) : error ? (
                    <Typography className={style.errorText}>Error, try again!</Typography>
                  ) : (
                    <Button onClick={handleIsHidden}>{row.freeBalance}</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div ref={forwardedRef} className={style.root}>
      <CurrencyTable />
    </div>
  );
};

export default BalanceComponent;
