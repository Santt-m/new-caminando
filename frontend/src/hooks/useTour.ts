import { useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useLanguage } from './useLanguage';
import { tourTranslations } from '@/data/tourTranslations';

export const useTour = () => {
    const { language } = useLanguage();
    const t = tourTranslations[language as keyof typeof tourTranslations] || tourTranslations.es;

    const createDriver = useCallback(() => {
        return driver({
            showProgress: true,
            allowClose: true,
            nextBtnText: t.next,
            prevBtnText: t.prev,
            doneBtnText: t.done,
        });
    }, [t]);

    const startHomeTour = useCallback(() => {
        const hasSeenTour = localStorage.getItem('tour_home_seen');
        if (hasSeenTour) return;

        const isMobile = window.innerWidth < 1024; // lg breakpoint

        const driverObj = createDriver();
        const steps = [
            {
                element: '#tour-search-bar',
                popover: {
                    title: t.search_title,
                    description: t.search_desc,
                    side: "bottom",
                    align: 'start'
                }
            }
        ];

        if (isMobile) {
            steps.push({
                element: '#tour-mobile-filter-btn',
                popover: {
                    title: t.sidebar_title,
                    description: t.sidebar_desc,
                    side: "bottom",
                    align: 'start'
                }
            });
        } else {
            steps.push(
                {
                    element: '#tour-products-sidebar',
                    popover: {
                        title: t.sidebar_title,
                        description: t.sidebar_desc,
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#tour-sidebar-categories',
                    popover: {
                        title: t.sidebar_categories_title,
                        description: t.sidebar_categories_desc,
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#tour-sidebar-brands',
                    popover: {
                        title: t.sidebar_brands_title,
                        description: t.sidebar_brands_desc,
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#tour-sidebar-price',
                    popover: {
                        title: t.sidebar_price_title,
                        description: t.sidebar_price_desc,
                        side: "right",
                        align: 'start'
                    }
                }
            );
        }

        steps.push({
            element: '#tour-product-card-0',
            popover: {
                title: t.product_card_title,
                description: t.product_card_desc,
                side: "top",
                align: 'center'
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        driverObj.setSteps(steps as any);

        driverObj.drive();
        localStorage.setItem('tour_home_seen', 'true');
    }, [createDriver, t]);

    const startProductTour = useCallback(() => {
        const driverObj = createDriver();
        driverObj.setSteps([
            {
                element: '#tour-product-info',
                popover: {
                    title: t.product_info_title,
                    description: t.product_info_desc,
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '#tour-product-zoom',
                popover: {
                    title: t.product_zoom_title,
                    description: t.product_zoom_desc,
                    side: "left",
                    align: 'center'
                }
            },
            {
                element: '#tour-product-variants',
                popover: {
                    title: t.product_variants_title,
                    description: t.product_variants_desc,
                    side: "top",
                    align: 'start'
                }
            },
            {
                element: '#tour-add-to-cart',
                popover: {
                    title: t.add_to_cart_title,
                    description: t.add_to_cart_desc,
                    side: "top",
                    align: 'center'
                }
            }
        ]);

        driverObj.drive();
    }, [createDriver, t]);

    const startCartTour = useCallback(() => {
        const driverObj = createDriver();
        driverObj.setSteps([
            {
                element: '#tour-cart-checkout-btn',
                popover: {
                    title: t.cart_checkout_title,
                    description: t.cart_checkout_desc,
                    side: "top",
                    align: 'center'
                }
            }
        ]);
        driverObj.drive();
    }, [createDriver, t]);

    const startCheckoutPageTour = useCallback(() => {
        const driverObj = createDriver();
        driverObj.setSteps([
            {
                element: '#tour-checkout-shipping',
                popover: {
                    title: t.checkout_shipping_title,
                    description: t.checkout_shipping_desc,
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#tour-checkout-delivery',
                popover: {
                    title: t.checkout_delivery_title,
                    description: t.checkout_delivery_desc,
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#tour-checkout-payment',
                popover: {
                    title: t.checkout_payment_title,
                    description: t.checkout_payment_desc,
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#tour-checkout-summary',
                popover: {
                    title: t.checkout_summary_title,
                    description: t.checkout_summary_desc,
                    side: "left",
                    align: 'center'
                }
            },
            {
                element: '#tour-checkout-pay-btn',
                popover: {
                    title: t.checkout_btn_title,
                    description: t.checkout_btn_desc,
                    side: "top",
                    align: 'center'
                }
            }
        ]);
        driverObj.drive();
    }, [createDriver, t]);

    return {
        startHomeTour,
        startProductTour,
        startCartTour,
        startCheckoutPageTour,
        t
    };
};
