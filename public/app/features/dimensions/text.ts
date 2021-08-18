import { DataFrame, formattedValueToString } from '@grafana/data';
import { DimensionSupplier, TextDimensionConfig, TextDimensionMode } from './types';
import { findField, getLastNotNullFieldValue } from './utils';

//---------------------------------------------------------
// Resource dimension
//---------------------------------------------------------

export function getTextDimension(frame: DataFrame | undefined, config: TextDimensionConfig): DimensionSupplier<string> {
  let v = config.fixed;
  const mode = config.mode ?? TextDimensionMode.Fixed;
  if (mode === TextDimensionMode.Fixed) {
    return {
      isAssumed: !Boolean(v),
      fixed: v,
      value: () => v,
      get: (i) => v,
    };
  }

  const field = findField(frame, config.field);
  if (mode === TextDimensionMode.Template) {
    const disp = (v: any) => {
      return `TEMPLATE[${config.fixed} // ${v}]`;
    };
    if (!field) {
      v = disp('');
      return {
        isAssumed: true,
        fixed: v,
        value: () => v,
        get: (i) => v,
      };
    }
    return {
      field,
      get: (i) => disp(field.values.get(i)),
      value: () => disp(getLastNotNullFieldValue(field)),
    };
  }

  if (!field) {
    return {
      isAssumed: true,
      fixed: v,
      value: () => v,
      get: (i) => v,
    };
  }

  let disp = (v: any) => formattedValueToString(field.display!(v));
  return {
    field,
    get: (i) => disp(field.values.get(i)),
    value: () => disp(getLastNotNullFieldValue(field)),
  };
}