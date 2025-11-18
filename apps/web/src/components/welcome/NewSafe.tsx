import React from 'react'
import { Typography } from '@mui/material'
import css from './styles.module.css'
import WelcomeLogin from './WelcomeLogin'
import { BRAND_NAME, BRAND_LOGO } from '@/config/constants'
import footerCss from './welcomeFooter.module.css'
import Footer from '../common/Footer'

const NewSafe = () => {
  return (
    <div className={css.loginPage}>
      <div className={css.leftSide}>
        {/* <div className={css.logoContainer}>
          {BRAND_LOGO ? (
            <img src={BRAND_LOGO} alt={BRAND_NAME} className={css.logo} style={{ height: '40px', width: 'auto' }} />
          ) : (
            <Typography variant="h4" fontWeight={700}>{BRAND_NAME}</Typography>
          )}
        </div> */}
        <div className={css.loginContainer}>
          <WelcomeLogin />
        </div>
        <Footer forceShow versionIcon={false} helpCenter={false} preferences={false} className={footerCss.footer} />
      </div>

      <div className={css.rightSide}>
        <div className={css.rightContent}>
          <Typography className={css.label}>FOR ORGANIZATIONS AND POWER USERS</Typography>
          <Typography className={css.mainTitle}>Own your assets onchain securely</Typography>
          <Typography className={css.subtitle}>
            A dedicated Aureus Safe interface to custody your onchain assets with multisig security, built for teams
            and power users.
          </Typography>
        </div>
        <div className={css.mockupImageContainer}>
          <svg
            className={css.mockupImage}
            viewBox="0 0 424 697"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Aureus"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M53.1387 354.043L35.5879 411.788L386.997 410.153L368.91 352.574L53.1387 354.043Z"
              fill="white"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.5508 469.624L0 527.37L422.685 525.403L404.598 467.824L17.5508 469.624Z"
              fill="white"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M209.34 0L1.21997 685.02L61.5729 684.739L210.25 195.567L363.471 683.335L423.905 683.054L209.34 0Z"
              fill="white"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.58032 696.097L1.21997 685.02L61.5729 684.739L5.58032 696.097Z"
              fill="white"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M423.905 683.054L419.637 694.2L363.471 683.335L423.905 683.054Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default NewSafe
