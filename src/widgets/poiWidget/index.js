import { distance2BetweenPoints } from '@kitware/vtk.js/Common/Core/Math';
import vtkAbstractWidgetFactory from '@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory';
import vtkPlanePointManipulator from '@kitware/vtk.js/Widgets/Manipulators/PlaneManipulator';
import vtkSphereHandleRepresentation from '@kitware/vtk.js/Widgets/Representations/SphereHandleRepresentation';
import vtkSphereContextRepresentation from '@kitware/vtk.js/Widgets/Representations/SphereContextRepresentation';
import macro from '@kitware/vtk.js/macros';

import widgetBehavior from './behavior';
import stateGenerator from './state';

export function vtkSphereWidget(publicAPI, model) {
  model.classHierarchy.push('vtkSphereWidget');

  const superClass = { ...publicAPI };

  model.methodsToLink = ['scaleInPixels'];

  publicAPI.getRepresentationsForViewType = (viewType) => [
    {
      builder: vtkSphereHandleRepresentation,
      labels: ['moveHandle'],
    },
    {
      builder: vtkSphereHandleRepresentation,
      labels: ['centerHandle'],
    },
    {
      builder: vtkSphereHandleRepresentation,
      labels: ['borderHandle'],
    },
    {
      builder: vtkSphereContextRepresentation,
      labels: ['sphereHandle'],
    },
  ];

  // --- Public methods -------------------------------------------------------

  publicAPI.getRadius = () => {
    const h1 = model.widgetState.getCenterHandle();
    const h2 = model.widgetState.getBorderHandle();
    return Math.sqrt(distance2BetweenPoints(h1.getOrigin(), h2.getOrigin()));
  };

  publicAPI.setManipulator = (manipulator) => {
    superClass.setManipulator(manipulator);
    model.widgetState.getMoveHandle().setManipulator(manipulator);
    model.widgetState.getCenterHandle().setManipulator(manipulator);
    model.widgetState.getBorderHandle().setManipulator(manipulator);
  };

  // --------------------------------------------------------------------------
  // initialization
  // --------------------------------------------------------------------------

  publicAPI.setManipulator(
    model.manipulator ||
      vtkPlanePointManipulator.newInstance({ useCameraNormal: true })
  );
}

const defaultValues = (initialValues) => ({
  behavior: widgetBehavior,
  widgetState: stateGenerator(),
  ...initialValues,
});

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, defaultValues(initialValues));
  vtkAbstractWidgetFactory.extend(publicAPI, model, initialValues);
  macro.setGet(publicAPI, model, ['manipulator', 'widgetState']);
  vtkSphereWidget(publicAPI, model);
}

export const newInstance = macro.newInstance(extend, 'vtkSphereWidget');

export default { newInstance, extend };