import React, { ReactNode } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

import { IComponentBaseProps } from '../types'

export type IndicatorProps = React.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    item?: ReactNode
    horizontal?: 'start' | 'center' | 'end'
    vertical?: 'top' | 'middle' | 'bottom'
    innerRef?: React.Ref<HTMLDivElement>
  }

const Indicator = React.forwardRef<HTMLDivElement, IndicatorProps>(
  (
    {
      children,
      item,
      horizontal = 'end',
      vertical = 'top',
      dataTheme,
      className,
      innerRef,
      ...props
    },
    ref
  ): JSX.Element => {
    const classes = twMerge(
      'indicator-item',
      className,
      clsx({
        'indicator-start': horizontal === 'start',
        'indicator-center': horizontal === 'center',
        'indicator-end': horizontal === 'end',
        'indicator-top': vertical === 'top',
        'indicator-middle': vertical === 'middle',
        'indicator-bottom': vertical === 'bottom',
      })
    )

    return (
      <div data-theme={dataTheme} className="indicator" ref={ref}>
        <div
          aria-label="Indicator"
          {...props}
          className={classes}
          ref={innerRef}
        >
          {item}
        </div>

        {children}
      </div>
    )
  }
)

export default Indicator
