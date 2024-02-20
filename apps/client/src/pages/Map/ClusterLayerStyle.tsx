import {
  createEmpty,
  extend,
  getHeight,
  getWidth
} from 'ol/extent';
import {Feature} from 'ol';
import {
  RCircle,
  RFill,
  RStroke,
  RStyle,
  RText,
} from 'rlayers/style';
import {useCallback} from 'react';

const extentFeatures = (features: Feature[], resolution: number) => {
  const extent = createEmpty();
  for (const f of features) extend(extent, f.getGeometry()!.getExtent());
  return Math.round(0.25 * (getWidth(extent) + getHeight(extent))) / resolution;
};

const minRadius: number = 25;

export const ClusterLayerStyle: React.FC = () =>
  <RStyle
    render={useCallback((feature: any, resolution: number) => {
      const size = feature.get('features').length;
      const radiusFeatures = extentFeatures(
	feature.get('features'),
	resolution
      );
      return <>
	<RCircle radius={radiusFeatures < minRadius ? minRadius : radiusFeatures}>
	  <RFill color='rgba(16, 101, 53, 0.8)' />
	  <RStroke color='#ffffff' width={4} />
	</RCircle>
	<RText text={size.toString()} scale={2.5}>
	  <RFill color='#ffffff' />
	  <RStroke color='#000000' width={4} />
	</RText>
      </>
    }, [])}
  />;
