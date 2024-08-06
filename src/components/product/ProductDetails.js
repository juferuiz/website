import React, { useEffect, useState, useRef } from 'react';
import './product.css';
import { BsHeart, BsPlus, BsHeartFill, BsShare } from "react-icons/bs";
import { BiMinus, BiLink } from 'react-icons/bi';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
import QuickViewModal from './QuickViewModal';
import { useTranslation } from 'react-i18next';
import Loader from '../loader/Loader';
import { clearSelectedProduct, setSelectedProduct } from '../../model/reducer/selectedProduct';
import { addtoGuestCart, setCart, setCartProducts, setCartSubTotal, setSellerFlag } from '../../model/reducer/cartReducer';
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import Popup from '../same-seller-popup/Popup';
import useGetProductRatingsById from '../../hooks/useGetProductRatingsById';
import { OverlayTrigger, Popover, ProgressBar } from 'react-bootstrap';
import ProductDetailsTabs from './ProductDetailsTabs';
import StarFilledSVG from "../../utils/StarFilled.svg";
import useGetProductRatingImages from '../../hooks/useGetProductRatingImages';
import { LuStar } from 'react-icons/lu';
import VegIcon from "../../utils/Icons/VegIcon.svg";
import NonVegIcon from "../../utils/Icons/NonVegIcon.svg";
import NonCancelable from "../../utils/Icons/NotCancelable.svg";
import Cancelable from "../../utils/Icons/Cancelable.svg";
import Returnable from "../../utils/Icons/Returnable.svg";
import NotReturnable from "../../utils/Icons/NotReturnable.svg";
import { ValidateNoInternet } from '../../utils/NoInternetValidator';
import { MdSignalWifiConnectedNoInternet0 } from 'react-icons/md';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { Navigation, Thumbs, Mousewheel, Autoplay, Pagination } from "swiper/modules";
import 'swiper/css/pagination';
import { AiOutlineEye } from 'react-icons/ai';
import { IoIosArrowDown } from "react-icons/io";

const ProductDetails = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { slug } = useParams();
    const location = useLocation();
    const product = useSelector(state => state.selectedProduct);
    const cart = useSelector(state => state.cart);
    const city = useSelector(state => state.city);
    const setting = useSelector(state => state.setting);
    const favorite = useSelector(state => (state.favourite));
    const shop = useSelector(state => state.shop);
    const user = useSelector(state => state.user);


    useEffect(() => {
        window.scrollTo({ top: 0 });
        return () => {
            dispatch(clearSelectedProduct({ data: null }));
            setproductcategory({});
            setproductbrand({});
        };
    }, []);

    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [mainimage, setmainimage] = useState("");
    const [images, setimages] = useState([]);
    const [productdata, setproductdata] = useState({});
    const [productSize, setproductSize] = useState({});
    const [productcategory, setproductcategory] = useState({});
    const [productbrand, setproductbrand] = useState({});
    const [relatedProducts, setrelatedProducts] = useState(null);
    const [loading, setisLoading] = useState(false);
    const [quantity, setQuantity] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedProduct, setselectedProduct] = useState({});
    // const [productSizes, setproductSizes] = useState(null);
    const [offerConatiner, setOfferContainer] = useState(0);
    const [variant_index, setVariantIndex] = useState(null);
    const [realted_variant_index, setRelatedVariantIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [p_id, setP_id] = useState(0);
    const [p_v_id, setP_V_id] = useState(0);
    const [qnty, setQnty] = useState(0);
    const [cartLoader, setCartLoader] = useState(false);
    const [isNetworkError, setIsNetworkError] = useState(false);

    const getProductDatafromApi = (slug) => {
        if (slug !== null || slug !== undefined) {
            api.getProductbyId(city.city?.latitude ? city.city?.latitude : setting?.setting?.default_city?.latitude, city.city?.longitude ? city.city?.longitude : setting?.setting?.default_city?.longitude, -1, user?.jwtToken, slug)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        dispatch(setSelectedProduct({ data: result?.data[0]?.id }));
                        setproductdata(result.data);
                        setVariantIndex(result.data.variants[0]?.id);
                        setSelectedVariant(result.data.variants?.length > 0 && result.data.variants.find((element) => element.id == variant_index) ? result.data.variants.find((element) => element.id == variant_index) : result.data.variants[0]);
                        setmainimage(result.data.image_url);
                        setimages(result.data.images);
                        setproductbrand(shop?.shop?.brands?.find((brand) => brand?.id == result?.data?.brand_id));
                    };
                })
                .catch(error => {
                    console.log(error);
                    const isNoInternet = ValidateNoInternet(error);
                    if (isNoInternet) {
                        setIsNetworkError(isNoInternet);
                    }
                });
        } else {
            return;
        }


    };



    // Add setting in depedancy array for clear cache
    useEffect(() => {
        if (slug) {
            getProductDatafromApi(slug);
        }
    }, [slug, setting]);


    // const fetchRelatedProducts = () => {
    //     api.getProductbyFilter(city.city?.latitude ? city.city?.latitude : setting?.setting?.default_city?.latitude, city.city?.longitude ? city.city?.longitude : setting?.setting?.default_city?.longitude, {
    //         category_id: productdata.category_id,
    //     }, user?.jwtToken)
    //         .then(response => response.json())
    //         .then(result => {
    //             if (result.status === 1) {
    //                 setproductSize(result.sizes);
    //                 setrelatedProducts(result.data);
    //             }
    //         })
    //         .catch(error => console.log(error));
    // };


    const [limit, setLimit] = useState(12);
    const [offset, setOffset] = useState(0);
    const { productRating, totalData, loading: Loading, error } = useGetProductRatingsById(user?.jwtToken, productdata?.id, limit, offset);
    const { ratingImages, totalImages } = useGetProductRatingImages(user?.jwtToken, productdata?.id, 8, offset);


    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty) => {
        setCartLoader(true);
        await api.addToCart(user?.jwtToken, product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    if (cart?.cartProducts?.find((product) => (product?.product_id == product_id) && (product?.product_variant_id == product_variant_id))?.qty == undefined) {
                        dispatch(setCart({ data: result }));
                        dispatch(setCartSubTotal({ data: result?.data?.sub_total }));
                        const updatedCartCount = [...cart?.cartProducts, { product_id: product_id, product_variant_id: product_variant_id, qty: qty }];
                        dispatch(setCartProducts({ data: updatedCartCount }));
                    } else {
                        const updatedProducts = cart?.cartProducts?.map(product => {
                            if ((product.product_id == product_id) && (product?.product_variant_id == product_variant_id)) {
                                return { ...product, qty: qty };
                            } else {
                                return product;
                            }
                        });
                        dispatch(setCart({ data: result }));
                        dispatch(setCartProducts({ data: updatedProducts }));
                        dispatch(setCartSubTotal({ data: result?.data?.sub_total }));
                    }
                }
                else if (result?.data?.one_seller_error_code == 1) {
                    dispatch(setSellerFlag({ data: 1 }));
                    // console.log(result.message);
                    // toast.error(t(`${result.message}`));
                } else {
                    toast.error(result.message);
                }
                // setisLoading(false);
                setCartLoader(false);
            });
    };

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        setisLoading(true);
        await api.removeFromCart(user?.jwtToken, product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    dispatch(setCartSubTotal({ data: result?.sub_total }));
                    const updatedCartProducts = cart?.cartProducts?.filter(product => {
                        if (product?.product_variant_id != product_variant_id) {
                            return product;
                        }
                    });
                    dispatch(setCartProducts({ data: updatedCartProducts ? updatedCartProducts : [] }));
                }
                else {
                    toast.error(result.message);
                }
                setisLoading(false);
            });
    };

    //Add to favorite
    const addToFavorite = async (product_id) => {
        // setisLoading(true);
        await api.addToFavotite(user?.jwtToken, product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    const updatedFavouriteProducts = [...favorite.favouriteProductIds, product_id];
                    dispatch(setFavouriteProductIds({ data: updatedFavouriteProducts }));
                    const updatedFavouriteLength = favorite?.favouritelength + 1;
                    dispatch(setFavouriteLength({ data: updatedFavouriteLength }));
                }
                else {
                    toast.error(result.message);
                }
                // setisLoading(false);
            });
    };

    const removefromFavorite = async (product_id) => {
        // setisLoading(true);
        await api.removeFromFavorite(user?.jwtToken, product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    // toast.success(result.message);
                    const updatedFavouriteProducts = favorite?.favouriteProductIds.filter(id => id != product_id);
                    dispatch(setFavouriteProductIds({ data: updatedFavouriteProducts }));
                    const updatedFavouriteLength = favorite?.favouritelength - 1;
                    dispatch(setFavouriteLength({ data: updatedFavouriteLength }));
                }
                else {
                    toast.error(result.message);
                }
                // setisLoading(false);
            });
    };

    // useEffect(() => {
    //     if (productdata.length > 0) {
    //         setSelectedVariant(productdata.varaints[0]);
    //     }
    // }, [productdata, cart]);

    // useEffect(() => {
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    // }, [productdata]);

    const handleVariantChange = (variant, index) => {
        setSelectedVariant(variant);
        setVariantIndex(index);
    };

    const { t } = useTranslation();

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo;
    };

    const calculatePercentage = (totalRating, starWiseRating) => {
        const percentage = (starWiseRating * 100) / totalRating;
        return percentage;
    };

    const popover = (
        <Popover>
            <Popover.Body className='ratingPopOverBody'>
                <div className='d-flex flex-row justify-content-start align-items-center ratingCircleContainer'>
                    <div className='ratingCircle'>
                        {productRating?.average_rating?.toFixed(2)}
                    </div>
                    <div className='d-flex flex-column justify-content-center align-items-center'>
                        <div>{t("rating")}
                        </div>
                        <div className='fw-bold'>
                            {totalData}
                        </div>
                    </div>
                </div>
                <div className='d-flex justify-content-start align-items-center gap-4'>
                    {t("5")}
                    <div className='d-flex gap-1'>
                        <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                    </div>
                    <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.five_star_rating))} className='ratingBar' />
                    <div>
                        {productRating?.five_star_rating}
                    </div>
                </div>
                <div className='d-flex justify-content-start align-items-center mt-3 gap-4'>
                    {t("4")}
                    <div className='d-flex gap-1'>
                        <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                    </div>
                    <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.four_star_rating))} className='ratingBar' />
                    <div>
                        {productRating?.four_star_rating}
                    </div>
                </div>
                <div className='d-flex justify-content-start align-items-center mt-3 gap-4'>
                    {t("3")}
                    <div className='d-flex gap-1'>
                        <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                    </div>
                    <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.three_star_rating))} className='ratingBar' />
                    <div>{productRating?.three_star_rating}</div>
                </div>
                <div className='d-flex justify-content-start align-items-center mt-3 gap-4'>
                    {t("2")}
                    <div className='d-flex gap-1'>
                        <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                    </div>
                    <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.two_star_rating))} className='ratingBar' />
                    <div>{productRating?.two_star_rating}</div>
                </div>
                <div className='d-flex justify-content-start align-items-center mt-3 gap-4'>
                    {t("1")}
                    <div className='d-flex gap-1'>
                        <img src={StarFilledSVG} alt='starLogo' loading='lazy' />
                    </div>
                    <ProgressBar now={Math.floor(calculatePercentage(totalData, productRating?.one_star_rating))} className='ratingBar' />
                    <div>{productRating?.one_star_rating}</div>
                </div>
            </Popover.Body>
        </Popover>
    );

    function getProductQuantities(products) {
        return Object?.entries(products?.reduce((quantities, product) => {
            const existingQty = quantities[product.product_id] || 0;
            return { ...quantities, [product.product_id]: existingQty + product.qty };
        }, {})).map(([productId, qty]) => ({
            product_id: parseInt(productId),
            qty
        }));
    }

    const handleValidateAddExistingProduct = (productQuantity, productdata) => {
        if (Number(productdata.is_unlimited_stock)) {
            if (productQuantity?.find(prdct => prdct?.product_id == productdata?.id)?.qty >= Number(productdata?.total_allowed_quantity)) {
                toast.error(t("max_cart_limit_error"));
            }
            else {
                addtoCart(productdata.id, selectedVariant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty + 1);
            }
        }
        else {
            if (productQuantity?.find(prdct => prdct?.product_id == productdata?.id)?.qty >= Number(selectedVariant.stock)) {
                toast.error(t("limited_product_stock_error"));
            }
            else if (cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty >= Number(setting.setting.max_cart_items_count)) {
                toast.error(t("max_cart_limit_error"));
            }
            else {
                addtoCart(productdata.id, selectedVariant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty + 1);
            }
        }

    };

    const handleValidateAddNewProduct = (productQuantity, productdata) => {
        if (user?.jwtToken !== "") {
            if (productQuantity?.find(prdct => prdct?.product_id == productdata?.id)?.qty >= Number(productdata?.total_allowed_quantity)) {
                toast.error(t("limited_product_stock_error"));
            }
            else if (Number(productdata.is_unlimited_stock)) {
                addtoCart(productdata.id, selectedVariant.id, 1);
            } else {
                if (selectedVariant.status) {
                    addtoCart(productdata.id, selectedVariant.id, 1);
                    setP_id(productdata.id);
                    setP_V_id(selectedVariant.id);
                    setQnty(1);
                } else {
                    toast.error(t("limited_product_stock_error"));
                }
            }
        }
        else {
            toast.error(t("required_login_message_for_cartRedirect"));
        }
    };

    const handleValidateAddExistingGuestProduct = (productQuantity, product, quantity) => {
        if (Number(product.is_unlimited_stock)) {
            if (productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error('Apologies, maximum product quantity limit reached');
            }
            else {
                AddToGuestCart(product?.id, selectedVariant.id, quantity, 1);
            }
        }
        else {
            if (selectedVariant.cart_count >= Number(selectedVariant.stock)) {
                toast.error('Oops, Limited Stock Available');
            }
            else if (productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty >= Number(product?.total_allowed_quantity)) {
                toast.error('Apologies, maximum cart quantity limit reached');
            }
            else {
                AddToGuestCart(product?.id, selectedVariant.id, quantity, 1);
            }
        }
    };

    const AddToGuestCart = (productId, productVariantId, Qty, isExisting) => {
        if (isExisting) {
            const updatedProducts = cart?.guestCart?.map((product) => {
                if (product?.product_id == productId && product?.product_variant_id == productVariantId) {
                    return { ...product, qty: Qty };
                } else {
                    return product;
                }
            }).filter(product => product?.qty !== 0);
            dispatch(addtoGuestCart({ data: updatedProducts }));
        } else {
            const productData = { product_id: productId, product_variant_id: productVariantId, qty: Qty };
            dispatch(addtoGuestCart({ data: [...cart?.guestCart, productData] }));
        }
    };

    const handleAddNewProductGuest = (productQuantity, product) => {
        if ((productQuantity?.find(prdct => prdct?.product_id == product?.id)?.qty || 0) < Number(product.total_allowed_quantity)) {
            AddToGuestCart(product.id, selectedVariant.id, 1, 0);
        } else {
            toast.error(t("max_cart_limit_error"));
        }
    };

    return (
        <>
            {loading && <Loader screen="full" background="none" />}
            {!isNetworkError ?
                <div className='product-details-view'>
                    <div id='productListingBreadcrumb' className='w-100 breadCrumbs'>
                        <div className='container d-flex align-items-center gap-2'>
                            <div className='breadCrumbsItem'>
                                <Link to={"/"}>{t("home")}</Link>
                            </div>
                            <div className='breadCrumbsItem'>/</div>
                            <div className='breadCrumbsItem'>
                                <Link className={location.pathname.split("/").findIndex(loc => loc == productdata?.slug) !== -1 ? "breadCrumbActive" : ""} to={location?.pathname}>{productdata?.name}</Link>
                            </div>
                        </div>
                    </div>
                    <div className='container' style={{ gap: "20px" }}>
                        <div className='top-wrapper'>

                            {product.selectedProduct_id === null || Object.keys(productdata).length === 0 ?
                                <Loader width={"100%"} height={"600px"} background={"var(--second-cards-color"} />
                                : (
                                    <div className='row body-wrapper '>
                                        <div className="col-xl-3 col-lg-4 col-md-12 col-12">
                                            <div className='image-wrapper '>
                                                <div className='main-image col-12 border'>
                                                    <img onError={placeHolderImage} src={mainimage} alt='main-product' className='col-12' />
                                                </div>
                                                <div className='sub-images-container'>
                                                    {images.length >= 1 ?
                                                        <Swiper style={{
                                                            '--swiper-navigation-color': '#fff',
                                                            '--swiper-pagination-color': '#fff',
                                                        }}
                                                            breakpoints={{
                                                                0: {
                                                                    slidesPerView: 3,
                                                                    spaceBetween: 6
                                                                },
                                                                500: {
                                                                    slidesPerView: 5,
                                                                    spaceBetween: 2
                                                                },
                                                                992: {
                                                                    slidesPerView: 3,
                                                                    spaceBetween: 5
                                                                }
                                                            }}
                                                            loop={true}
                                                            navigation={true}
                                                            thumbs={{ swiper: thumbsSwiper }}
                                                            modules={[Navigation, Thumbs, Mousewheel, Autoplay, Pagination]}
                                                            className="mySwiper2">

                                                            {images?.map((image, index) => {
                                                                return (
                                                                    <SwiperSlide>
                                                                        <div key={index} className={`sub-image border ${mainimage == image ? 'active' : ''}`}>
                                                                            <img onError={placeHolderImage} src={image} className='col-12' alt="product" onClick={() => {
                                                                                setmainimage(image);
                                                                            }} />
                                                                        </div>
                                                                    </SwiperSlide>
                                                                )

                                                            })}

                                                        </Swiper>
                                                        :
                                                        <>
                                                            {images.map((image, index) => (
                                                                <div key={index} className={`sub-image border ${mainimage === image ? 'active' : ''}`}>
                                                                    <img onError={placeHolderImage} src={image} className='col-12 ' alt="product" onClick={() => {
                                                                        setmainimage(image);
                                                                    }}></img>
                                                                </div>
                                                            ))}
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-9 col-lg-8 col-md-12 col-12">
                                            <div className='detail-wrapper'>
                                                <div className='top-section'>
                                                    <p className='product_name'>{productdata.name}</p>
                                                    {/* {Object.keys(productbrand).length === 0
                                                    ? null
                                                    : (
                                                        <div className='product-brand'>
                                                            <span className='brand-title'>{t("brand")}:</span>
                                                            <span className='brand-name' onClick={() => {
                                                                dispatch({ type: ActionTypes.SET_FILTER_BRANDS, payload: productbrand.id.toString() })
                                                                navigate('/products')
                                                            }}>
                                                                {productbrand.name}
                                                            </span>
                                                        </div>
                                                    )} */}
                                                    <div className='d-flex flex-column gap-2 align-items-start my-1'>
                                                        <div id="price-section" className='d-flex flex-row gap-2 align-items-center my-1'>
                                                            {setting.setting && setting.setting.currency}<p id='fa-rupee' className='m-0'>{selectedVariant ? (selectedVariant.discounted_price == 0 ? selectedVariant.price.toFixed(setting.setting && setting.setting.decimal_point) : selectedVariant.discounted_price.toFixed(setting.setting && setting.setting.decimal_point)) : (productdata.variants[0].discounted_price === 0 ? productdata.variants[0].price.toFixed(setting.setting && setting.setting.decimal_point) : productdata.variants[0].discounted_price.toFixed(setting.setting && setting.setting.decimal_point))}</p>
                                                        </div>
                                                        {(selectedVariant?.price && (selectedVariant?.discounted_price !== 0)) && (selectedVariant?.price !== selectedVariant?.discounted_price) ?
                                                            <div>
                                                                <p className='fw-normal text-decoration-line-through' style={{ color: "var(--sub-text-color)", fontSize: "16px" }}>
                                                                    {setting.setting && setting.setting.currency}
                                                                    {selectedVariant?.price?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                </p>
                                                            </div>
                                                            : null}
                                                        <input type="hidden" id="productdetail-selected-variant-id" name="variant" value={selectedVariant ? selectedVariant.id : productdata.variants[0].id} />
                                                    </div>

                                                </div>
                                                <div className='bottom-section'>
                                                    <div className='d-flex gap-3 bottom-section-content'>
                                                        <div className='variants' key={"productVariantContainer"}>

                                                            <div className="row" key={"variants"}>
                                                                {productdata.variants.map((variant, index) => {
                                                                    return (
                                                                        <div className="variant-section" key={variant?.id}>
                                                                            <div className={`variant-element ${variant_index === variant.id ? 'active' : ''}   `} key={index}>
                                                                                <label className="element_container " htmlFor={`variant${index}`}>
                                                                                    <div className="top-section">
                                                                                        <input type="radio" name="variant" id={`variant${index}`} checked={variant_index == variant.id} onChange={() => handleVariantChange(variant, variant.id)} />
                                                                                    </div>
                                                                                    <div className="h-100">
                                                                                        <span className="d-flex align-items-center flex-column variantMeasure">{variant.measurement} {variant.stock_unit_name} </span>
                                                                                    </div>
                                                                                </label>

                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="cart_option">
                                                            {selectedVariant ?
                                                                ((cart?.isGuest === false && user?.user && cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty >= 1)
                                                                    || (cart?.isGuest === true && cart?.guestCart?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty > 0)
                                                                    ? <>
                                                                        <div id={`input-cart-quickview`} className="input-to-cart">
                                                                            <button
                                                                                type='button'
                                                                                onClick={() => {
                                                                                    if (cart?.isGuest) {
                                                                                        AddToGuestCart(
                                                                                            productdata?.id,
                                                                                            selectedVariant?.id,
                                                                                            cart?.guestCart?.find(prdct => prdct.product_id == productdata.id && prdct.product_variant_id == selectedVariant?.id)?.qty - 1,
                                                                                            1
                                                                                        );
                                                                                    } else {
                                                                                        if (cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty == 1) {
                                                                                            removefromCart(productdata.id, selectedVariant.id);
                                                                                        }
                                                                                        else {
                                                                                            addtoCart(productdata.id, selectedVariant.id, cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty - 1);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                className="wishlist-button">
                                                                                <BiMinus fill='#fff' />
                                                                            </button>

                                                                            <span id={`input-quickview`}>
                                                                                {cartLoader ? <div className="spinner-border text-muted"></div> :
                                                                                    cart?.isGuest === false ?
                                                                                        cart?.cartProducts?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty
                                                                                        :
                                                                                        cart?.guestCart?.find(prdct => prdct?.product_variant_id == selectedVariant.id)?.qty
                                                                                }
                                                                            </span>

                                                                            <button
                                                                                type='button'
                                                                                onClick={() => {
                                                                                    if (cart?.isGuest) {
                                                                                        const productQuantity = getProductQuantities(cart?.guestCart);
                                                                                        handleValidateAddExistingGuestProduct(
                                                                                            productQuantity,
                                                                                            productdata,
                                                                                            cart?.guestCart?.find(prdct => prdct?.product_variant_id == selectedVariant?.id)?.qty + 1
                                                                                        );
                                                                                    } else {
                                                                                        const productQuantity = getProductQuantities(cart?.cartProducts);
                                                                                        handleValidateAddExistingProduct(productQuantity, productdata);
                                                                                    }
                                                                                }}
                                                                                className="wishlist-button">
                                                                                <BsPlus fill='#fff' />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                    :
                                                                    <>
                                                                        <button type='button' id={`Add-to-cart-quickview`} className='add-to-cart'
                                                                            onClick={() => {
                                                                                if (cart?.isGuest) {
                                                                                    const productQuantity = getProductQuantities(cart?.guestCart);
                                                                                    handleAddNewProductGuest(productQuantity, productdata);
                                                                                }
                                                                                else {
                                                                                    if (user?.user === null) {
                                                                                        return toast.error(t("required_login_message_for_cart"));
                                                                                    }
                                                                                    const productQuantity = getProductQuantities(cart?.cartProducts);
                                                                                    handleValidateAddNewProduct(productQuantity, productdata);
                                                                                }
                                                                            }}>{t("add_to_cart")}</button>
                                                                    </>)
                                                                : null}
                                                            {favorite.favorite && favorite?.favouriteProductIds?.some(id => id == productdata.id) ? (
                                                                <button type="button" className='wishlist-product' onClick={() => {
                                                                    if (user?.jwtToken !== "") {
                                                                        removefromFavorite(productdata.id);
                                                                    } else {
                                                                        toast.error(t('required_login_message_for_wishlist'));
                                                                    }
                                                                }}>
                                                                    <BsHeartFill size={16} fill='green' />
                                                                </button>)
                                                                : (
                                                                    <button key={productdata.id} type="button" className='wishlist-product' onClick={() => {
                                                                        if (user?.jwtToken !== "") {
                                                                            addToFavorite(productdata.id);
                                                                        } else {
                                                                            toast.error(t("required_login_message_for_wishlist"));
                                                                        }
                                                                    }}>
                                                                        <BsHeart size={16} /></button>
                                                                )}
                                                        </div>
                                                    </div>
                                                    {productdata?.fssai_lic_no &&
                                                        <div className='fssai-details'>
                                                            <div className='image-container'>
                                                                <img src={productdata?.fssai_lic_img} alt='fssai' />
                                                            </div>
                                                            <div className='fssai-license-no'>
                                                                <span>
                                                                    {`${t('license_no')} : ${productdata.fssai_lic_no}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    }
                                                    {productbrand?.name ?
                                                        <div className='product-overview'>
                                                            <div className='product-seller'>
                                                                <span className='seller-title'>{t("brand")}:</span>
                                                                <span className='seller-name'>{productbrand?.name} </span>
                                                            </div>
                                                        </div> : null}
                                                    {productRating?.rating_list?.length !== 0 ?
                                                        <div className='mt-3 cursorPointer'>
                                                            <OverlayTrigger
                                                                trigger="click"
                                                                placement="bottom-start"
                                                                overlay={popover}
                                                                rootClose={true}
                                                            >
                                                                <div className='d-flex justify-content-start align-items-center overlay-content'>
                                                                    <LuStar className='me-1' style={productRating?.average_rating >= 1 ? { fill: "#F4CD32", stroke: "#F4CD32" } : {}} />
                                                                    <span className='pe-2 me-2 border-end border-2'>
                                                                        {productRating?.average_rating?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                    </span>
                                                                    {totalData}
                                                                </div>
                                                            </OverlayTrigger>
                                                        </div> : null}
                                                    {productdata?.indicator ?
                                                        productdata?.indicator == 1 ?
                                                            <div className='d-flex align-items-center mt-3'>
                                                                <img src={VegIcon} alt='vegIcon' className='me-3' />
                                                                <p className='veg-indicator'>{t("vegetarian")}</p>
                                                            </div>
                                                            :
                                                            <div className='d-flex align-items-center mt-3'>
                                                                <img src={NonVegIcon} alt='nonVegIcon' className='me-3' />
                                                                {t("non-vegetarian")}
                                                            </div>
                                                        : null}
                                                    {productdata?.cancelable_status == 1 ?
                                                        <div className='d-flex align-items-center mt-3 cancelContainer'>
                                                            <img src={Cancelable} alt='cancelableIcon' className='me-3' />
                                                            <span className='cancelDetail'>
                                                                {t("cancelable")}
                                                                {productdata?.till_status == 1 ?
                                                                    t("payment_pending")
                                                                    :
                                                                    null
                                                                }
                                                                {productdata?.till_status == 2 ?
                                                                    t("received")
                                                                    :
                                                                    null
                                                                }
                                                                {productdata?.till_status == 3 ?
                                                                    t("processed")
                                                                    :
                                                                    null
                                                                }
                                                                {productdata?.till_status == 4 ?
                                                                    t("shipped")
                                                                    :
                                                                    null
                                                                }
                                                                {productdata?.till_status == 5 ?
                                                                    t("out_for_delivery")
                                                                    :
                                                                    null
                                                                }
                                                            </span>
                                                        </div>
                                                        :
                                                        <div className='d-flex align-items-center mt-3 cancelContainer'>
                                                            <img src={NonCancelable} alt='nonCancelableIcon' className='me-3' />
                                                            <span className='cancelDetail'>{t("non-cancelable")}</span>
                                                        </div>
                                                    }
                                                    {productdata?.return_status == 1 ?
                                                        <div className='d-flex align-items-center mt-3 returnContainer'>
                                                            <img src={Returnable} alt='returnableIcon' className='me-3' />
                                                            <span className='returnDetail'>{t("returnable")} {productdata?.return_days} {t("days")}</span>
                                                        </div>
                                                        :
                                                        <div className='d-flex align-items-center mt-3 returnContainer'>
                                                            <img src={NotReturnable} alt='nonReturnableIcon' className='me-3' />
                                                            <span className='returnDetail'>{t("non-returnable")}</span>
                                                        </div>
                                                    }
                                                    <div className="share-product-container">
                                                        <span>{t("share_product")}:</span>

                                                        <ul className='share-product'>
                                                            <li className='share-product-icon'><WhatsappShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${productdata.slug}`}><WhatsappIcon size={32} round={true} /> </WhatsappShareButton></li>
                                                            <li className='share-product-icon'><TelegramShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${productdata.slug}`}><TelegramIcon size={32} round={true} /> </TelegramShareButton></li>
                                                            <li className='share-product-icon'><FacebookShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${productdata.slug}`}><FacebookIcon size={32} round={true} /> </FacebookShareButton></li>
                                                            <li className='share-product-icon'>
                                                                <button type='button' onClick={() => {
                                                                    navigator.clipboard.writeText(`${setting.setting && setting.setting.web_settings.website_url}/product/${productdata.slug}`);
                                                                    toast.success("Copied Succesfully!!");
                                                                }} > <BiLink size={30} /></button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                        </div>

                        <ProductDetailsTabs
                            productdata={productdata}
                            productRating={productRating}
                            totalData={totalData}
                            loading={Loading}
                            ratingImages={ratingImages}
                            totalImages={totalImages}
                        />
                        {
                            productdata?.related_products?.length > 0 ? <div className='related-product-wrapper'>
                                <h5>{t("related_product")}</h5>
                                <div className='related-product-container'>
                                    {productdata?.related_products === null
                                        ? <div className="d-flex justify-content-center">
                                            <Loader width={"100%"} height={"600px"} />
                                        </div>
                                        :
                                        <div className="row">
                                            <Swiper style={{
                                                '--swiper-navigation-color': '#fff',
                                                '--swiper-pagination-color': '#fff',
                                            }}
                                                breakpoints={{
                                                    0: {
                                                        slidesPerView: 1,
                                                        spaceBetween: 6
                                                    },
                                                    500: {
                                                        slidesPerView: 3,
                                                        spaceBetween: 10
                                                    },
                                                    992: {
                                                        slidesPerView: 5,
                                                        spaceBetween: 30
                                                    }
                                                }}
                                                // slidesPerView={5}
                                                // spaceBetween={30}
                                                // loop={true}
                                                navigation={true}
                                                thumbs={{ swiper: thumbsSwiper }}
                                                modules={[Navigation, Thumbs, Mousewheel, Autoplay, Pagination]}
                                            // className="mySwiper2"
                                            >
                                                {productdata?.related_products?.map((related_product, index) => (
                                                    <div className="col-md-3 " key={related_product?.id}>
                                                        <SwiperSlide>
                                                            <div className='product-card'>
                                                                <span className='border border-light rounded-circle p-2 px-3' id='aiEye' onClick={() => {
                                                                    setShowModal(true);
                                                                    setselectedProduct(related_product);
                                                                    setP_id(related_product.id); setP_V_id(related_product.variants[0].id); setQnty(related_product.variants[0].cart_count + 1);
                                                                }} >
                                                                    <AiOutlineEye fill='black'
                                                                    />
                                                                </span>
                                                                <Link to={`/product/${related_product.slug}`}>

                                                                    <div className='image-container' >

                                                                        <img onError={placeHolderImage} src={related_product.image_url} alt={related_product.slug} className='card-img-top' onClick={() => {
                                                                            navigate(`/product/${related_product.slug}`);
                                                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                                                            // dispatch({ type: ActionTypes.SET_SELECTED_PRODUCT, payload: related_product.id });
                                                                            dispatch(setSelectedProduct({ data: related_product.id }));
                                                                            getProductDatafromApi();

                                                                        }} />
                                                                        {!Number(related_product.is_unlimited_stock) && related_product.variants[0].status === 0 &&
                                                                            <div className="out_of_stockOverlay">
                                                                                <p className="out_of_stockText">{t("out_of_stock")}</p>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                </Link>

                                                                <div className="d-flex flex-column justify-content-end card-body product-card-body p-3" onClick={() => {
                                                                    dispatch(setSelectedProduct({ data: related_product.id }));
                                                                    setSelectedVariant(null);
                                                                    setQuantity(0);
                                                                    getProductDatafromApi();
                                                                    navigate(`/product/${related_product.slug}`);
                                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }} >
                                                                    {related_product?.rating_count > 0 ? <div className='ratings d-flex align-items-center product-card-rating-content' style={{ fontSize: "14px" }}>
                                                                        <LuStar className='me-2' style={{ fill: "#fead0e", stroke: "#fead0e" }} />
                                                                        <div className='border-end border-2 pe-2 me-2 avgRating'>
                                                                            {related_product?.average_rating?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                        </div>
                                                                        <div>
                                                                            {related_product?.rating_count}
                                                                        </div>
                                                                    </div> : null}
                                                                    <h3>{related_product.name}</h3>
                                                                    <div className='price'>

                                                                        <span id={`price${index}-section`} className="d-flex align-items-center">
                                                                            <p id='relatedproduct-fa-rupee' className='m-0'>
                                                                                {setting.setting && setting.setting.currency}
                                                                                {related_product.variants[0].discounted_price === 0 ? related_product.variants[0].price.toFixed(setting.setting && setting.setting.decimal_point) : related_product.variants[0].discounted_price.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                            </p>
                                                                            {(related_product?.variants[0]?.price && (related_product?.variants[0]?.discounted_price != 0)) && (related_product?.variants[0]?.price !== related_product?.variants[0]?.discounted_price) ?
                                                                                <span id={`price${index}-section`} className="d-flex align-items-center" >
                                                                                    <p id='relatedproduct-fa-rupee' className='fw-normal text-decoration-line-through m-0' style={{ color: "var(--sub-text-color)", fontSize: "14px" }}>{setting.setting && setting.setting.currency}
                                                                                        {related_product?.variants[0]?.price?.toFixed(setting.setting && setting.setting.decimal_point)}
                                                                                    </p>
                                                                                </span>
                                                                                : null}
                                                                        </span>
                                                                    </div>
                                                                    <div className='product_varients_drop'>
                                                                        {related_product.variants.length > 1 ?
                                                                            <>
                                                                                <div className='variant_selection' onClick={() => {

                                                                                    setselectedProduct(related_product);
                                                                                }} >
                                                                                    <span>{<>{related_product.variants[0].measurement} {related_product.variants[0].stock_unit_name}    </>}</span>
                                                                                    <IoIosArrowDown />
                                                                                </div>
                                                                            </>
                                                                            :

                                                                            <>
                                                                                <span className={`variant_value select-arrow ${related_product.variants[0].stock > 0 ? '' : 'text-decoration-line-through'}`}>{related_product.variants[0].measurement + " " + related_product.variants[0].stock_unit_name}
                                                                                </span>
                                                                            </>}



                                                                    </div>
                                                                </div>

                                                                <div className='d-flex flex-row border-top product-card-footer'>
                                                                    <div className='border-end '>
                                                                        {favorite?.favorite && favorite?.favorite?.data?.some(element => element?.id === related_product?.id) ? (
                                                                            <button type="button" className='wishlist-product' onClick={() => {
                                                                                if (user?.jwtToken !== undefined) {
                                                                                    removefromFavorite(related_product.id);
                                                                                } else {
                                                                                    toast.error(t('required_login_message_for_cart'));
                                                                                }
                                                                            }}
                                                                            >
                                                                                <BsHeartFill size={16} fill='green' />
                                                                            </button>
                                                                        ) : (
                                                                            <button key={related_product.id} type="button" className='wishlist-product' onClick={() => {
                                                                                if (user?.jwtToken !== undefined) {
                                                                                    addToFavorite(related_product.id);
                                                                                } else {
                                                                                    toast.error(t("required_login_message_for_cart"));
                                                                                }
                                                                            }}>
                                                                                <BsHeart size={16} /></button>
                                                                        )}
                                                                    </div>

                                                                    <div className='border-end' style={{ flexGrow: "1" }} >
                                                                        {related_product.variants[0].cart_count > 0 ? <>
                                                                            <div id={`input-cart-productdetail`} className="input-to-cart">
                                                                                <button type='button' className="wishlist-button" onClick={() => {

                                                                                    if (related_product.variants[0].cart_count === 1) {
                                                                                        removefromCart(related_product.id, related_product.variants[0].id);

                                                                                    }
                                                                                    else {
                                                                                        addtoCart(related_product.id, related_product.variants[0].id, related_product.variants[0].cart_count - 1);


                                                                                    }

                                                                                }}><BiMinus size={20} fill='#fff' /></button>
                                                                                <span id={`input-productdetail`} >{quantity}</span>
                                                                                <div className="quantity-container text-center">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="1"
                                                                                        max={related_product.variants[0].stock}
                                                                                        className="quantity-input bg-transparent text-center"
                                                                                        value={related_product.variants[0].cart_count}
                                                                                        // value={cart.cart && cart.cart.data.cart.some(element => element.id === product.variants[0].id ? element.qty : 0)}
                                                                                        onChange={(e) => {
                                                                                            setQuantity(parseInt(e.target.value));
                                                                                        }}
                                                                                        disabled
                                                                                    />
                                                                                </div>
                                                                                <button type='button' className="wishlist-button" onClick={() => {

                                                                                    if (Number(related_product.is_unlimited_stock)) {

                                                                                        if (related_product.variants[0].cart_count < Number(setting.setting.max_cart_items_count)) {
                                                                                            addtoCart(related_product.id, related_product.variants[0].id, related_product.variants[0].cart_count + 1);


                                                                                        } else {
                                                                                            toast.error('Apologies, maximum product quantity limit reached!');
                                                                                        }
                                                                                    } else {

                                                                                        if (related_product.variants[0].cart_count >= Number(related_product.variants[0].stock)) {
                                                                                            toast.error(t("out_of_stock_message"));
                                                                                        }
                                                                                        else if (related_product.variants[0].cart_count >= Number(related_product.total_allowed_quantity)) {
                                                                                            toast.error('Apologies, maximum product quantity limit reached');
                                                                                        } else {
                                                                                            addtoCart(related_product.id, related_product.variants[0].id, related_product.variants[0].cart_count + 1);


                                                                                        }
                                                                                    }

                                                                                }}><BsPlus size={20} fill='#fff' /> </button>
                                                                            </div>
                                                                        </> : <>
                                                                            <button type="button" id={`Add-to-cart-section${index}`} className={`w-100 h-100 add-to-cart active ${(!Number(related_product.is_unlimited_stock) && (related_product.variants[0].stock <= 0)) ? "buttonDisabled" : ""} `} onClick={() => {
                                                                                if (user?.jwtToken !== undefined) {

                                                                                    if (cart.cart && cart.cart.data.cart.some(element => element.product_id === related_product.id) && cart.cart.data.cart.some(element => element.product_variant_id === related_product.variants[0].id)) {
                                                                                        toast.info('Product already in Cart');
                                                                                    } else {
                                                                                        if (Number(related_product.variants[0].stock) > 1) {

                                                                                            addtoCart(related_product.id, related_product.variants[0].id, 1);
                                                                                        } else {
                                                                                            toast.error(t("out_of_stock_message"));
                                                                                        }
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    toast.error("OOps! You need to login first to access the cart!");
                                                                                }

                                                                            }} disabled={!Number(related_product.is_unlimited_stock) && related_product.variants[0].stock <= 0}>{t("add_to_cart")}</button>
                                                                        </>}

                                                                    </div>


                                                                    <div className='dropup share'>

                                                                        <button type="button" className='w-100 h-100 ' data-bs-toggle="dropdown" aria-expanded="false"><BsShare size={16} /></button>

                                                                        <ul className='dropdown-menu'>
                                                                            <li className='dropDownLi'><WhatsappShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${related_product.slug}`}><WhatsappIcon size={32} round={true} /> <span>WhatsApp</span></WhatsappShareButton></li>
                                                                            <li className='dropDownLi'><TelegramShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${related_product.slug}`}><TelegramIcon size={32} round={true} /> <span>Telegram</span></TelegramShareButton></li>
                                                                            <li className='dropDownLi'><FacebookShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${related_product.slug}`}><FacebookIcon size={32} round={true} /> <span>Facebook</span></FacebookShareButton></li>
                                                                            <li>
                                                                                <button type='button' onClick={() => {
                                                                                    navigator.clipboard.writeText(`${setting.setting && setting.setting.web_settings.website_url}product/${related_product.slug}`);
                                                                                    toast.success("Copied Succesfully!!");
                                                                                }} className="react-share__ShareButton"> <BiLink size={30} /> <span>{("TapToCopy")}</span></button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>
                                                    </div>

                                                ))}
                                            </Swiper>
                                        </div>

                                    }

                                </div>
                            </div> : <></>
                        }



                        <QuickViewModal selectedProduct={selectedProduct} setselectedProduct={setselectedProduct} showModal={showModal} setShowModal={setShowModal} setP_V_id={setP_V_id} setP_id={setP_id} />
                        <Popup product_id={p_id} product_variant_id={p_v_id} quantity={qnty} toast={toast} city={city} />
                    </div>

                </div > :
                <div className='d-flex flex-column justify-content-center align-items-center noInternetContainer'>
                    <MdSignalWifiConnectedNoInternet0 />
                    <p>{t("no_internet_connection")}</p>
                </div>
            }
        </>

    );
};

export default ProductDetails;
