import React, { useState, useRef, useEffect } from 'react';
import './login.css';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import api from '../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';
import 'react-phone-input-2/lib/style.css';
import OTPInput from 'otp-input-react';
import { signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FirebaseData from '../../utils/firebase/FirebaseData';
import PhoneInput from 'react-phone-input-2';
import { setAuthId, setCurrentUser, setFcmToken, setJWTToken } from '../../model/reducer/authReducer';
import { Modal } from 'react-bootstrap';
import { setSetting } from '../../model/reducer/settingReducer';
import { setFavouriteLength, setFavouriteProductIds } from '../../model/reducer/favouriteReducer';
import { addtoGuestCart, setCart, setCartProducts, setIsGuest } from '../../model/reducer/cartReducer';
import NewUserModal from '../newusermodal/NewUserModal';
import { IoCloseSharp } from "react-icons/io5";
import GoogleAuthButton from "../../utils/buttons/googleLogin.svg"
import AppleAuthButton from "../../utils/buttons/appleLogin.svg"
import { isMacOs, isIOS } from "react-device-detect"
import GoogleLogo from "../../utils/google-color-icon.svg"


const Login = React.memo((props) => {

    const { auth, firebase, messaging } = FirebaseData();
    const setting = useSelector(state => (state.setting));
    const city = useSelector(state => state.city);
    const user = useSelector(state => state.user);
    const cart = useSelector(state => state.cart);
    const [fcm, setFcm] = useState('');
    const [registerModalShow, setRegisterModalShow] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [userEmail, setUserEmail] = useState("")
    const [userName, setUserName] = useState("")
    const [authType, setAuthType] = useState("")

    useEffect(() => {
        const initializeFirebaseMessaging = async () => {
            if (setting?.setting && messaging) {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        const currentToken = await messaging.getToken();
                        if (currentToken) {
                            setFcm(currentToken);
                            if (user?.fcm_token === null || currentToken != user?.fcm_token) {
                                dispatch(setFcmToken({ data: currentToken }));
                            }
                        } else {
                            // console.log("No registration token available");
                        }
                    } else {
                        setFcm("");
                        // console.log("Notification permission denied");
                    }
                } catch (error) {
                    console.log("An error occurred:", error);
                }
            }
        };

        if (setting.setting?.firebase) {
            initializeFirebaseMessaging();
        }
    }, [setting]);
    // console.log(fcm);



    const Navigate = useNavigate();
    const closeModalRef = useRef();
    const dispatch = useDispatch();

    const [phonenum, setPhonenum] = useState(process.env.REACT_APP_DEMO_MODE == "true" ?
        `${process.env.REACT_APP_COUNTRY_DIAL_CODE}${process.env.REACT_APP_DEMO_LOGIN_NO}` : "");

    const [countryCode, setCountryCode] = useState(process.env.REACT_APP_COUNTRY_DIAL_CODE);
    const [checkboxSelected, setcheckboxSelected] = useState(false);
    const [error, setError] = useState("", setTimeout(() => {
        if (error !== "")
            setError("");
    }, 5000));
    const [isOTP, setIsOTP] = useState(false);
    const [Uid, setUid] = useState("");
    const [OTP, setOTP] = useState(process.env.REACT_APP_DEMO_MODE == "true" ? process.env.REACT_APP_DEMO_OTP : "");
    const [isLoading, setisLoading] = useState(false);
    const [timer, setTimer] = useState(null); // Initial timer value in seconds
    const [disabled, setDisabled] = useState(true);
    const { t } = useTranslation();


    // console.log(phonenum, countryCode);

    useEffect(() => {
        if (props.show == true) {
            setPhonenum(process.env.REACT_APP_DEMO_MODE == "true" ?
                `${process.env.REACT_APP_COUNTRY_DIAL_CODE}${process.env.REACT_APP_DEMO_LOGIN_NO}` : "");
            setCountryCode(process.env.REACT_APP_DEMO_MODE == "true" ?
                process.env.REACT_APP_COUNTRY_DIAL_CODE : ""
            );
            setOTP(process.env.REACT_APP_DEMO_MODE == "true" ? process.env.REACT_APP_DEMO_OTP : "");
        }
    }, [props.show]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setDisabled(false); // Enable the button once the timer reaches 0
        }

        return () => clearInterval(interval); // Cleanup the interval on unmount or timer reset

    }, [timer]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        // if (firebase && auth && window.recaptchaVerifier && setting.setting.firebase) {
        //     if (window?.recaptchaVerifier) {
        //         try {
        //             window?.recaptchaVerifier?.clear();
        //         } catch (err) {
        //             console.log(err?.message);
        //         }
        //     }

        // }
        const recaptchaContainer = document.getElementById('recaptcha-container');
        firebase && auth && !(window.recaptchaVerifier) && (window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
            size: "invisible",
            // other options
        }));
        return () => {
            if (window?.recaptchaVerifier && setting.setting.firebase) {
                try {
                    window?.recaptchaVerifier?.clear();
                } catch (err) {
                    console.log(err?.message);
                }
            }
        };
    }, [firebase, auth]);


    const handleLogin = (e) => {
        setDisabled(true);
        setisLoading(true);
        e.preventDefault();
        // if (!checkboxSelected) {
        //     setError("Accept Terms and Policies!");
        //     setisLoading(false);
        // }
        // else {
        if (phonenum?.length < countryCode.length || phonenum?.slice(1) === countryCode) {
            setError("Please enter phone number!");
            setisLoading(false);
        }
        else {
            // setOTP("");

            //OTP Generation
            // generateRecaptcha();
            let appVerifier = window?.recaptchaVerifier;
            try {
                signInWithPhoneNumber(auth, phonenum, appVerifier)
                    .then(confirmationResult => {
                        window.confirmationResult = confirmationResult;
                        setTimer(90);
                        setIsOTP(true);
                        setisLoading(false);
                    }).catch((err) => {
                        setPhonenum();
                        console.log(err);
                        setError(err.message);
                        setisLoading(false);
                    });
            } catch (error) {
                setisLoading(false);
                toast.error(error);
            }
        }
        // else {
        //     setPhonenum()
        //     setError("Enter a valid phone number")
        // }
        // }
    };


    const getCurrentUser = (token) => {
        api.getUser(token)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCurrentUser({ data: result.user }));
                    // dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
                    toast.success("You're successfully Logged In");
                }
            });
    };

    const fetchCart = async (token, latitude, longitude) => {
        await api.getCart(token, latitude, longitude)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch(setCart({ data: result }));
                    const productsData = result?.data?.cart?.map((product) => {
                        return {
                            product_id: product?.product_id,
                            product_variant_id: product?.product_variant_id,
                            qty: product?.qty
                        };
                    });
                    dispatch(setCartProducts({ data: productsData }));
                }
                else {
                    dispatch(setCart({ data: null }));
                }
            })
            .catch(error => console.log(error));
    };
    //otp verification
    const verifyOTP = async (e) => {
        e.preventDefault();
        setisLoading(true);
        let confirmationResult = window.confirmationResult;
        await confirmationResult.confirm(OTP).then(async (result) => {
            // User verified successfully.
            setUid(result.user.uid);
            dispatch(setAuthId({ data: result.user.uid }));
            await loginApiCall(result.user, result.user.uid, fcm, "phone")
            //login call
            // console.log(phonenum);
            const num = phonenum.replace(`${countryCode}`, "");
            // isUserVerified(num.replace("+", ""), result.user.uid);
        }).catch(() => {
            setisLoading(false);
            // User couldn't sign in (bad verification code?)
            setOTP("");
            setError("Invalid Code");

        });
    };



    const AddtoCartBulk = async (token) => {
        try {
            const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
            const quantities = cart?.guestCart?.map((p) => p.qty);
            const response = await api.bulkAddToCart(token, variantIds.join(","), quantities.join(","));
            const result = await response.json();
            if (result.status == 1) {
                // toast.success(t("guest_products_added_to_cart"));
                dispatch(addtoGuestCart({ data: [] }));
            } else {
                console.log("Add to Bulk Cart Error Occurred");
            }
        } catch (e) {
            console.log(e?.message);
        }
    };

    const loginApiCall = async (user, Uid, fcm, type) => {
        dispatch(setAuthId({ data: Uid }));
        await api.login(Uid, fcm)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    getCurrentUser(result.data.access_token);
                    api.getSettings(1, result.data.access_token)
                        .then((req) => req.json())
                        .then((res) => {
                            if (res.status == 1) {
                                dispatch(setSetting({ data: res?.data }));
                                dispatch(setFavouriteLength({ data: res?.data?.favorite_product_ids?.length }));
                                dispatch(setFavouriteProductIds({ data: res?.data?.favorite_product_ids }));
                            }
                        });

                    dispatch(setJWTToken({ data: result.data.access_token }));
                    // dispatch(setAuthId({ data: Uid }));

                    if (result.data?.user?.status == 1) {
                        dispatch(setIsGuest({ data: false }));
                    }
                    if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && result.data?.user?.status == 1) {
                        await AddtoCartBulk(result.data.access_token);
                        // dispatch(setIsGuest({ data: false }));
                    }
                    await fetchCart(result.data.access_token, city?.city?.latitude ? city?.city?.latitude : setting?.setting?.default_city?.latitude,
                        city?.city?.longitude ? city?.city?.longitude : setting?.setting?.default_city?.longitude
                    );
                    // setlocalstorageOTP(Uid);
                    setError("");
                    setOTP("");
                    setPhonenum("");
                    setcheckboxSelected(false);
                    setisLoading(false);
                    setIsOTP(false);
                    props.setShow(false);
                    // closeModalRef.current.click();
                }
                else {
                    setUserEmail(user?.providerData?.[0]?.email)
                    setUserName(user?.providerData?.[0]?.displayName)
                    setPhonenum(user?.providerData?.[0]?.phoneNumber)
                    setAuthType(type)
                    setRegisterModalShow(true)
                    // setOTP("");
                    // console.log("Message", result?.message);
                }
                setisLoading(false);
            })
            .catch(error => console.log("error ", error));

    };




    const handleGoogleAuthentication = async () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).then(async (result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            await loginApiCall(user, user.uid, fcm, "google")
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleAppleAuthentication = async () => {
        const provider = new OAuthProvider('apple.com');
        provider.setCustomParameters({
            // Localize the Apple authentication screen in French.
            locale: 'en'
        });
        provider.setDefaultLanguage("en")

        provider.addScope('email');
        provider.addScope('name');
        console.log(provider)
        await signInWithPopup(auth, provider).then((result) => {
            console.log(result)
            const user = result.user;
            const credential = OAuthProvider.credentialFromResult(result);
            const accessToken = credential.accessToken;
            const idToken = credential.idToken;
            console.log("user->", user)
        }).catch((error) => {
            console.log(error)
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = OAuthProvider.credentialFromError(error);
        });
    }



    const handleTerms = () => {
        props.setShow(false);
        // Navigate('/terms');
    };
    const handlePolicy = () => {
        props.setShow(false);
        // Navigate('/policy/Privacy_Policy');
    };

    const handleOnChange = (value, data, event, formattedValue) => {
        //console.log(value, ' formattedValue');
        if (value?.length > 0) {
            setPhonenum(`+${value}`);
        } else {
            setPhonenum("");
        }
        setCountryCode(data?.dialCode);
        setOTP("");
    };
    const newReturn = (
        <>
            <Modal
                size='md'
                className='login'
                show={props.show}
                centered
                backdrop="static"
            >
                <Modal.Header className='d-flex flex-row justify-content-between align-items-center header'>
                    <div>
                        {isOTP ? <h5 className='login-heading'>{t("otp_verify")}</h5> :

                            <h5 className='login-heading'>{t("Login")}</h5>
                        }
                    </div>
                    <IoCloseSharp type='button' className='closeBtn' size={30} onClick={() => {
                        setError("");
                        setOTP("");
                        setPhonenum("");
                        setcheckboxSelected(false);
                        setisLoading(false);
                        setIsOTP(false);
                        props.setShow(false);
                    }} />
                </Modal.Header>
                <Modal.Body className='d-flex flex-column gap-3  body'>
                    {/* <img src={setting.setting && setting.setting.web_settings.web_logo} alt='logo'></img> */}
                    <div className='my-5'>
                        {isOTP
                            ? (
                                <>
                                    <h5>{t("enter_verification_code")}</h5>
                                    <span className='d-flex flex-column text-start align-items-start otp-message'>{t("otp_send_message")} <p className='font-weight-bold py-2 text-secondary'>{phonenum}</p></span>
                                </>
                            )
                            : (
                                <>
                                    <h5>{t("Welcome")}</h5>
                                    <span>{t("login_enter_number")}</span>
                                </>
                            )}
                    </div>


                    {error === ''
                        ? ""
                        : <span className='error-msg'>{error}</span>}

                    {isOTP
                        ? (
                            <form className='d-flex flex-column gap-3 form w-100' onSubmit={verifyOTP}>
                                {isLoading
                                    ? (
                                        <Loader width='100%' height='auto' />
                                    )
                                    : null}
                                <OTPInput className='otp-container' inputStyle="otp-container-style" value={OTP} onChange={setOTP} autoFocus OTPLength={6} otpType="number" disabled={false} />
                                <span className='timer' >
                                    <button onClick={handleLogin} disabled={disabled}>
                                        {timer === 0 ?
                                            `Resend OTP` : <>Resend OTP in <strong> {formatTime(timer)} </strong> </>}
                                    </button> </span>
                                <span className='button-container d-flex gap-5'>
                                    <button type="submit" className='login-btn' >{t("verify_and_proceed")}</button>
                                </span>
                            </form>
                        )
                        : (
                            <div>
                                <form className='d-flex flex-column gap-3 form' onSubmit={handleLogin}>
                                    {isLoading
                                        ? (
                                            <Loader width='100%' height='auto' />
                                        )
                                        : null}


                                    <div>
                                        <PhoneInput
                                            country={process.env.REACT_APP_COUNTRY_CODE}
                                            value={phonenum}
                                            onChange={handleOnChange}
                                            enableSearch
                                            disableSearchIcon
                                            placeholder={t('please_enter_valid_phone_number')}
                                            disableDropdown={false}
                                            inputClass='loginInput'
                                            searchClass='loginSearch'
                                        />
                                    </div>
                                    {/* <span style={{ alignSelf: "baseline" }}>
                                        <input type="checkbox" className='mx-2' required checked={checkboxSelected} onChange={() => {
                                            setcheckboxSelected(!checkboxSelected);
                                        }} />


                                        {t("agreement_message")} &nbsp;<Link to={"/terms"} onClick={handleTerms}>{t("terms_of_service")}</Link> &nbsp;{t("and")}
                                        <Link to={"/policy/Privacy_Policy"} onClick={handlePolicy}>&nbsp; {t("privacy_policy")} &nbsp;</Link>
                                    </span> */}
                                    <button type='submit'> {t("login_continue")}</button>
                                </form>
                                <p className='text-center login-or'>OR</p>
                                {/* {isIOS || isMacOs ?
                                    
                                    
                                    } */}
                                {/* TODO: */}
                                <div className='google-auth-container'>
                                    <button className='login-google-btn' onClick={handleGoogleAuthentication}><img src={GoogleLogo} className='google-log-img' />{t("continue_with_google")}</button>
                                </div>
                                {/* <button onClick={handleAppleAuthentication}><img src={AppleAuthButton} className='login-google-btn' /></button> */}

                                {/* <button onClick={handleGoogleAuthentication}><img src={GoogleAuthButton} className='login-google-btn ' /></button> */}

                                <span style={{ alignSelf: "baseline", marginTop: "20px", fontSize: "12px" }}>
                                    {/* <input type="checkbox" className='mx-2' required checked={checkboxSelected} onChange={() => {
                                        setcheckboxSelected(!checkboxSelected);
                                    }} /> */}

                                    {t("agreement_updated_message")} &nbsp;<Link to={"/terms"} onClick={handleTerms}>{t("terms_of_service")}</Link> &nbsp;{t("and")}
                                    <Link to={"/policy/Privacy_Policy"} onClick={handlePolicy}>&nbsp; {t("privacy_policy")} &nbsp;</Link>
                                </span>
                            </div>
                        )}
                </Modal.Body>
            </Modal>
            <div id="recaptcha-container" style={{ display: "none" }}></div>
            <NewUserModal
                registerModalShow={registerModalShow}
                setRegisterModalShow={setRegisterModalShow}
                phoneNum={phonenum}
                setPhoneNum={setPhonenum}
                countryCode={countryCode.replace("+", "")}
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                userName={userName}
                setUserName={setUserName}
                authType={authType}
                setLoginModal={props.setShow}
            />
        </>
    );
    return newReturn;
});

export default Login;