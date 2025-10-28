import {
  validateSize,
  validateAngle,
  validateRadius,
  validatePosition,
} from "@utils/UIHelperFunctions";

const PositionSchema = {
  type: "group",
  name: "position",
  fields: [
    {
      type: "number",
      name: "shapeX",
      label: "X Position",
      attributes: { required: true, value: 0, name: "x" },
      validation: [{ event: "change", handler: validatePosition }],
    },
    {
      type: "number",
      name: "shapeY",
      label: "Y Position",
      attributes: { required: true, value: 0, name: "y" },
      validation: [{ event: "change", handler: validatePosition }],
    },
  ],
};
const RotationSchema = {
  type: "number",
  name: "shapeRotation",
  label: "Rotation (Degrees)",
  attributes: { required: true, value: 0, min: 0, max: 360, name: "rotation" },
  validation: [{ event: "change", handler: validateAngle }],
};
const DimensionsSchema = {
  type: "group",
  name: "dimensions",
  fields: [
    {
      type: "number",
      name: "shapeWidth",
      label: "Width",
      attributes: { required: true, value: 100, min: 10, name: "width" },
      validation: [{ event: "change", handler: validateSize }],
    },
    {
      type: "number",
      name: "shapeHeight",
      label: "Height",
      attributes: { required: true, value: 100, min: 10, name: "height" },
      validation: [{ event: "change", handler: validateSize }],
    },
  ],
};
const ColorSchema = {
  type: "color",
  name: "shapeColor",
  label: "Color",
  attributes: {
    required: true,
    value: "#563d7c",
    title: "Choose your color",
    name: "color",
  },
  classes: ["form-control-color"],
};
const RadiusSchema = {
  type: "number",
  name: "shapeRadius",
  label: "Radius",
  attributes: { required: true, value: 50, min: 5, name: "radius" },
  validation: [{ event: "change", handler: validateRadius }],
};
const ArcAngleSchema = {
  type: "group",
  name: "arcAngles",
  fields: [
    {
      type: "number",
      name: "shapeStartAngle",
      label: "Start Angle",
      attributes: {
        required: true,
        value: 0,
        min: 0,
        max: 360,
        name: "startAngle",
      },
      validation: [{ event: "change", handler: validateAngle }],
    },
    {
      type: "number",
      name: "shapeEndAngle",
      label: "End Angle",
      attributes: {
        required: true,
        value: 180,
        min: 0,
        max: 360,
        name: "endAngle",
      },
      validation: [{ event: "change", handler: validateAngle }],
    },
  ],
};
const PolygonPointsSchema = {
  type: "group",
  name: "polygonGroup",
  fields: [
    {
      type: "points",
      name: "polygonPoints",
      label: "Polygon Points",
      attributes: { required: true },
    },
  ],
};

const ShapeFieldSchemas = {
  RECTANGLE: [PositionSchema, RotationSchema, DimensionsSchema, ColorSchema],
  ELLIPSE: [PositionSchema, RotationSchema, DimensionsSchema, ColorSchema],
  ARC: [
    PositionSchema,
    RotationSchema,
    RadiusSchema,
    ArcAngleSchema,
    ColorSchema,
  ],
  POLYGON: [PositionSchema, RotationSchema, PolygonPointsSchema, ColorSchema],
  CUSTOM: [PositionSchema, RotationSchema, DimensionsSchema, ColorSchema],
};

export {
  ShapeFieldSchemas,
  PositionSchema,
  RotationSchema,
  DimensionsSchema,
  ColorSchema,
  RadiusSchema,
  ArcAngleSchema,
  PolygonPointsSchema,
};
