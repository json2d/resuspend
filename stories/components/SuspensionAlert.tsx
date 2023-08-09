import React from 'react';

export default function SuspensionAlert(props: { msg: string }) {
  return <pre role="alert">{props.msg}</pre>;
}

SuspensionAlert.defaultProps = {
  msg: 'loading...',
};
