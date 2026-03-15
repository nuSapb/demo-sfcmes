import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for staggered entrance animation using GSAP ScrollTrigger
 */
export const useStaggeredEntrance = (containerRef, itemSelector = '.project-card-item', options = {}) => {
  const {
    duration = 0.6,
    stagger = 0.1,
    delay = 0,
    fromVars = { opacity: 0, y: 40 },
    scrollTrigger = {},
  } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll(itemSelector);
    if (items.length === 0) return;

    gsap.from(items, {
      ...fromVars,
      duration,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
        ...scrollTrigger,
      },
      willChange: 'transform, opacity',
      force3D: true,
    });

    return () => {
      gsap.killTweensOf(items);
    };
  }, [containerRef, itemSelector, duration, stagger, delay, fromVars, scrollTrigger]);
};

/**
 * Hook for 3D tilt effect on hover
 */
export const useTilt3D = (elementRef, options = {}) => {
  const {
    maxRotationX = 12,
    maxRotationY = 12,
    scale = 1.02,
    shadowIntensity = 1,
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotationY = ((x - centerX) / centerX) * maxRotationY;
      const rotationX = ((centerY - y) / centerY) * maxRotationX;

      const shadowValue = (Math.abs(rotationX) + Math.abs(rotationY)) / (maxRotationX + maxRotationY);
      const shadowBlur = 20 + shadowValue * 30;
      const shadowSpread = 5 + shadowValue * 15;

      gsap.to(element, {
        rotationX,
        rotationY,
        scale,
        boxShadow: `0 ${shadowSpread}px ${shadowBlur}px rgba(0, 0, 0, ${0.15 + shadowValue * 0.25})`,
        duration: 0.3,
        overwrite: 'auto',
        force3D: true,
        willChange: 'transform',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        duration: 0.4,
        ease: 'power2.out',
        force3D: true,
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.style.perspective = '1200px';
    element.style.transformStyle = 'preserve-3d';

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(element);
    };
  }, [elementRef, maxRotationX, maxRotationY, scale, shadowIntensity]);
};

/**
 * Hook for parallax effect on nested elements
 */
export const useParallax = (parentRef, childRef, options = {}) => {
  const { strength = 15, ease = 'sine.out' } = options;

  useEffect(() => {
    const parent = parentRef.current;
    const child = childRef.current;
    if (!parent || !child) return;

    const handleMouseMove = (e) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const offsetX = ((x - centerX) / centerX) * strength * -1;
      const offsetY = ((y - centerY) / centerY) * strength * -1;

      gsap.to(child, {
        x: offsetX,
        y: offsetY,
        duration: 0.3,
        ease,
        overwrite: 'auto',
        force3D: true,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(child, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        force3D: true,
      });
    };

    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(child);
    };
  }, [parentRef, childRef, strength, ease]);
};

export default {
  useStaggeredEntrance,
  useTilt3D,
  useParallax,
};
