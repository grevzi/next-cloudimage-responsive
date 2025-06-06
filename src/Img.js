import { useEffect, useRef, useState } from 'react';
import Image from 'next/legacy/image';
import { generateAlt, getImgSRC, processReactNode } from 'cloudimage-responsive-utils';

import { computeImageStyles, getWrapperClassName, computeImageSize } from './utils/compute';
import { parseParams, parseImageSrc } from './utils/parse';
import { WRAPPER_STYLES } from './styles.constants';

import classes from './normalize.styles.module.css';


export function Img(props) {
  const { config = {} } = props;

  const {
    customDomain, domain, token, apiVersion,
    doNotReplaceURL: imagesDoNotReplaceURL, baseURL, params: imagesParams,
    quality: imagesQuality, layout: imagesLayout, objectFit: imagesObjectFit,
    lowPreviewQuality: imagesLowPreviewQuality, transitionDuration: imagesTransitionDuration,
    ssr: imagesSsr, objectPosition: imagesObjectPosition, lazyload: imagesLazyload,
    renderBlurImage: imagesRenderBlurImage = true,
  } = config;

  const {
    quality = imagesQuality, src, params = imagesParams,
    layout = imagesLayout, objectFit = imagesObjectFit,
    lowPreviewQuality = imagesLowPreviewQuality, onImgLoad, onImgLoadError,
    width, height, doNotReplaceURL = imagesDoNotReplaceURL,
    className, alt, transitionDuration = imagesTransitionDuration,
    style = {}, ssr = imagesSsr, children, background, objectPosition = imagesObjectPosition,
    lazyload = imagesLazyload, renderBlurImage = imagesRenderBlurImage,
  } = props;

  const [loaded, setLoaded] = useState(false);
  const [cloudImgSrc, setCloudImgSrc] = useState('');
  const [cloudImgSrcSet, setCloudImgSrcSet] = useState('');

  const wrapperRef = useRef();
  const previousSrc = useRef();

  let previousWidth;
  const cName = customDomain ? domain : `${token}.${domain}`;
  const _params = parseParams(params);
  const [_src] = getImgSRC(src, baseURL);
  const _alt = alt || generateAlt(src);

  const cloudimageLoader = (context, lowPreview) => {
    const { width: imageWidth } = context;
    const lowPreviewWidth = imageWidth / (100 / lowPreviewQuality);

    return parseImageSrc({
      cName,
      doNotReplaceURL,
      apiVersion,
      src: _src,
      width: lowPreview ? lowPreviewWidth : imageWidth,
      params: _params,
      lowPreview,
    });
  };

  const onImageLoad = (event) => {
    setLoaded(true);
    previousSrc.current = src;

    if (typeof onImgLoad === 'function') {
      onImgLoad(event);
    }
  };

  const onImageLoadError = (event) => {
    setLoaded(false);

    if (typeof onImgLoadError === 'function') {
      onImgLoadError({ event, setLoaded });
    }
  };

  const processImage = (update, windowScreenBecomesBigger) => {
    const options = {
      src,
      width,
      params,
      doNotReplaceURL,
      config: { ...config, params: undefined },
    };

    const { cloudimgSRCSET, cloudimgURL } = processReactNode(
      options,
      wrapperRef.current,
      update,
      windowScreenBecomesBigger,
      config,
      false,
    ) || {};

    if (cloudimgSRCSET && cloudimgURL) {
      const _srcSet = cloudimgSRCSET
        .map(({ dpr, url }) => `${url} ${dpr}x`).join(', ');

      setCloudImgSrc(cloudimgURL);
      setCloudImgSrcSet(_srcSet);
    }
  };

  const handleWindowResize = () => {
    const windowInnerWidth = window.innerWidth;

    if (previousWidth && previousWidth !== windowInnerWidth) {
      processImage(
        true,
        windowInnerWidth > previousWidth,
      );
      previousWidth = windowInnerWidth;
    }
  };

  const wrapperClassName = background
    ? classes.ciBackgroundWrapper : classes[getWrapperClassName(layout)];

  useEffect(() => {
    if (ssr) return;

    previousWidth = window.innerWidth;
    setLoaded(false);

    processImage();

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [src]);


  return (
    <div
      ref={wrapperRef}
      style={{ ...WRAPPER_STYLES, ...style }}
      className={`${wrapperClassName}${className ? ` ${className}` : ''}`}
    >
      {renderBlurImage && !loaded && (
        <Image
          src={src}
          loader={(context) => cloudimageLoader(context, true)}
          layout="fill"
          priority
          objectFit={objectFit}
          objectPosition={objectPosition}
          fetchPriority="high"
          alt={`low-preview-${_alt}`}
          {...computeImageSize(layout, width, height)}
        />
      )}

      {ssr ? (
        <Image
          src={src}
          layout={layout}
          loader={cloudimageLoader}
          quality={quality}
          objectFit={objectFit}
          objectPosition={objectPosition}
          style={computeImageStyles(loaded, transitionDuration)}
          onLoad={onImageLoad}
          loading={lazyload ? 'lazy' : 'eager'}
          fetchPriority={lazyload ? 'low' : 'high'}
          alt={_alt}
          onError={onImageLoadError}
          {...computeImageSize(layout, width, height)}
        />
      ) : (
        <img
          src={cloudImgSrc}
          srcSet={cloudImgSrcSet}
          alt={_alt}
          onLoad={onImageLoad}
          style={computeImageStyles(loaded, transitionDuration, objectFit, objectPosition, !previousSrc.current)}
          className={classes.ciSsgImage}
          loading={lazyload ? 'lazy' : 'eager'}
          fetchPriority={lazyload ? 'high' : 'low'}
          onError={onImageLoadError}
        />
      )}

      {background && (
        <div className={classes.ciBackgroundContent}>
          {children}
        </div>
      )}
    </div>
  );
}
