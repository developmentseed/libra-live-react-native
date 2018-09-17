import React from 'react';
import PropTypes from 'prop-types';

import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';

export default function CircleRadialGradient(props) {
  const { height, width } = props;
  return (
    <Svg version="1.1" xmlns="http://www.w3.org/2000/svg" height={height} width={width}>
      <Defs>
        <RadialGradient
          id="grad"
          cx={width / 2}
          cy={height / 2}
          rx={width / 2}
          ry={height / 2}
          fx={width / 2}
          fy={height / 2}
          gradientUnits="userSpaceOnUse"
        >
          <Stop
            offset="0"
            stopColor="#292929"
            stopOpacity="1"
          />
          <Stop
            offset="1"
            stopColor="#000"
            stopOpacity="1"
          />
        </RadialGradient>
      </Defs>
      <Circle
        cx={width / 2}
        cy={height / 2}
        r={height / 2}
        fill="url(#grad)"
      />
    </Svg>
  );
}

CircleRadialGradient.defaultProps = {
  width: 100,
  height: 100,
};

CircleRadialGradient.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};
