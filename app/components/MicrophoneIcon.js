import React from 'react';
import PropTypes from 'prop-types';

import Svg, {
  Path,
} from 'react-native-svg';

export default function MicrophoneIcon(props) {
  const { height, width } = props;
  return (
    <Svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="-68 94 50 82" height={height} width={width}>
      <Path
        fill="#000000"
        d="M-53,133v-22c0-5.5,4.5-10,10-10s10,4.5,10,10v22c0,5.5-4.5,10-10,10S-53,138.5-53,133z M-25,133c0-1.1-0.9-2-2-2
        s-2,0.9-2,2c0,7.7-6.3,14-14,14s-14-6.3-14-14c0-1.1-0.9-2-2-2s-2,0.9-2,2c0,9.2,7,16.9,16,17.9V161h-7c-1.1,0-2,0.9-2,2s0.9,2,2,2
        h18c1.1,0,2-0.9,2-2s-0.9-2-2-2h-7v-10.1C-32,149.9-25,142.2-25,133z"
      />
    </Svg>
  );
}

MicrophoneIcon.defaultProps = {
  width: 12,
  height: 20,
};

MicrophoneIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};
