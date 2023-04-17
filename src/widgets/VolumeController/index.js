
import macro from '@kitware/vtk.js/macros';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMapsLite';
import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget';

import style from './VolumeController.module.css'

// ----------------------------------------------------------------------------
// Global structures
// ----------------------------------------------------------------------------

const PRESETS_OPTIONS = vtkColorMaps.rgbPresetNames.map(
    (name) => `<option value="${name}">${name}</option>`
  );

  let currentPreset = "erdc_rainbow_bright";
  
  // ----------------------------------------------------------------------------
  // vtkVolumeController methods
  // ----------------------------------------------------------------------------
  
  function vtkVolumeController(publicAPI, model) {
    // Set our className
    model.classHierarchy.push('vtkVolumeController');
  
    model.el = document.createElement('div');
    model.el.setAttribute('class', style.container);
  
    model.widget = vtkPiecewiseGaussianWidget.newInstance({
      numberOfBins: 256,
      size: model.size,
    });

    publicAPI.updateShadow = (newValue) => {
      updateUseShadow(newValue);
    }
  
    function updateUseShadow(useShadow) {
      model.actor.getProperty().setShade(useShadow);
      model.renderWindow.render();
    }
  
    publicAPI.updatePreset = (str) => {
      currentPreset = str;
      updateColorMapPreset();
    }

    function updateColorMapPreset() {
      const sourceDS = model.actor.getMapper().getInputData();
      if (!sourceDS) {
        return;
      }
  
      const dataArray =
        sourceDS.getPointData().getScalars() ||
        sourceDS.getPointData().getArrays()[0];
      const dataRange = model.rescaleColorMap
        ? model.colorDataRange
        : dataArray.getRange();
      const preset = vtkColorMaps.getPresetByName(
        currentPreset
      );
      const lookupTable = model.actor.getProperty().getRGBTransferFunction(0);
      lookupTable.applyColorMap(preset);
      lookupTable.setMappingRange(...dataRange);
      lookupTable.updateRange();
      model.renderWindow.render();
    }

    publicAPI.updateSpacing = (value) => {
      updateSpacing(value);
    }
  
    function updateSpacing(value) {
      const sourceDS = model.actor.getMapper().getInputData();
      const sampleDistance =
        0.7 *
        Math.sqrt(
          sourceDS
            .getSpacing()
            .map((v) => v * v)
            .reduce((a, b) => a + b, 0)
        );
      model.actor
        .getMapper()
        .setSampleDistance(sampleDistance * 2 ** (value * 3.0 - 1.5));
      model.renderWindow.render();
    }

    publicAPI.updateEdgeGradient = (value) => {
      updateEdgeGradient(value)
    }
  
    function updateEdgeGradient(value) {
  
      if (value === 0) {
        model.actor.getProperty().setUseGradientOpacity(0, false);
      } else {
        const sourceDS = model.actor.getMapper().getInputData();
        const dataArray =
          sourceDS.getPointData().getScalars() ||
          sourceDS.getPointData().getArrays()[0];
        const dataRange = dataArray.getRange();
        model.actor.getProperty().setUseGradientOpacity(0, true);
        const minV = Math.max(0.0, value - 0.3) / 0.7;
        model.actor
          .getProperty()
          .setGradientOpacityMinimumValue(
            0,
            (dataRange[1] - dataRange[0]) * 0.2 * minV * minV
          );
        model.actor
          .getProperty()
          .setGradientOpacityMaximumValue(
            0,
            (dataRange[1] - dataRange[0]) * 1.0 * value * value
          );
      }
      model.renderWindow.render();
    }
  
    publicAPI.setupContent = (
      renderWindow,
      actor,
      isBackgroundDark,
    ) => {
      publicAPI.setActor(actor);
      publicAPI.setRenderWindow(renderWindow);
  
      const sourceDS = model.actor.getMapper().getInputData();
      const dataArray =
        sourceDS.getPointData().getScalars() ||
        sourceDS.getPointData().getArrays()[0];
      const lookupTable = model.actor.getProperty().getRGBTransferFunction(0);
      const piecewiseFunction = model.actor.getProperty().getScalarOpacity(0);
  
      const stylePostFix = isBackgroundDark ? 'DarkBG' : 'BrightBG';

      model.el.innerHTML = `
        <div class="js-pwf js-toggle"></div>
      `;
  
      // DOM elements
      const widgetContainer = model.el.querySelector('.js-pwf');
  
      // Piecewise editor widget
      model.widget.updateStyle({
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        histogramColor: 'rgba(100, 100, 100, 0.5)',
        strokeColor: 'rgb(0, 0, 0)',
        activeColor: 'rgb(255, 255, 255)',
        handleColor: 'rgb(50, 150, 50)',
        buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
        buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
        buttonStrokeColor: 'rgba(0, 0, 0, 1)',
        buttonFillColor: 'rgba(255, 255, 255, 1)',
        strokeWidth: 2,
        activeStrokeWidth: 3,
        buttonStrokeWidth: 1.5,
        handleWidth: 3,
        iconSize: 0,
        padding: 5,
      });

      model.widget.addGaussian(0.5, 1.0, 0.5, 0.5, 0.4);
      model.widget.setDataArray(dataArray.getData());
      model.widget.setColorTransferFunction(lookupTable);
      model.widget.applyOpacity(piecewiseFunction);
      model.widget.setContainer(widgetContainer);
      model.widget.bindMouseListeners();
      model.colorDataRange = model.widget.getOpacityRange();
  
      model.widget.onOpacityChange(() => {
        model.widget.applyOpacity(piecewiseFunction);
        model.colorDataRange = model.widget.getOpacityRange();
        if (model.rescaleColorMap) {
          updateColorMapPreset();
        }
  
        if (!model.renderWindow.getInteractor().isAnimating()) {
          model.renderWindow.render();
        }
      });
  
      model.widget.onAnimation((start) => {
        if (start) {
          model.renderWindow.getInteractor().requestAnimation(model.widget);
        } else {
          model.renderWindow.getInteractor().cancelAnimation(model.widget);
          model.renderWindow.render();
        }
      });
  
      lookupTable.onModified(() => {
        model.widget.render();
        if (!model.renderWindow.getInteractor().isAnimating()) {
          model.renderWindow.render();
        }
      });
  
      // Apply starting values
      updateColorMapPreset();
      updateUseShadow(1);
      updateSpacing(0.4);
      updateEdgeGradient(0.2);
    };
  
    publicAPI.setContainer = (el) => {
      if (model.container && model.container !== el) {
        model.container.removeChild(model.el);
      }
      if (model.container !== el) {
        model.container = el;
        if (model.container) {
          model.container.appendChild(model.el);
        }
        publicAPI.modified();
      }
    };
  
    const rescaleColorMap = publicAPI.setRescaleColorMap;
    publicAPI.setRescaleColorMap = (value) => {
      if (rescaleColorMap(value)) {
        updateColorMapPreset();
        return true;
      }
      return false;
    };
  
    publicAPI.toggleVisibility = () => {
      publicAPI.setExpanded(!publicAPI.getExpanded());
    };
  
    publicAPI.setSize = model.widget.setSize;
    publicAPI.render = model.widget.render;
    publicAPI.onAnimation = model.widget.onAnimation;
  
    // Trigger rendering for any modified event
    publicAPI.onModified(publicAPI.render);
    publicAPI.setSize(...model.size);
  }
  
  // ----------------------------------------------------------------------------
  // Object factory
  // ----------------------------------------------------------------------------
  
  const DEFAULT_VALUES = {
    size: [600, 300],
    expanded: true,
    rescaleColorMap: false,
  };
  
  // ----------------------------------------------------------------------------
  
  export function extend(publicAPI, model, initialValues = {}) {
    Object.assign(model, DEFAULT_VALUES, initialValues);
  
    // Object methods
    macro.obj(publicAPI, model);
    macro.setGet(publicAPI, model, ['actor', 'renderWindow', 'rescaleColorMap']);
    macro.get(publicAPI, model, ['widget']);
  
    // Object specific methods
    vtkVolumeController(publicAPI, model);
  }
  
  // ----------------------------------------------------------------------------
  
  export const newInstance = macro.newInstance(extend, 'vtkVolumeController');
  
  // ----------------------------------------------------------------------------
  
  export default { newInstance, extend };