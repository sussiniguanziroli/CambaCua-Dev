import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, writeBatch, doc, increment, serverTimestamp, getDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { FaTicketAlt, FaTimes } from 'react-icons/fa';
import LoaderSpinner from './LoaderSpinner';

const CouponRedeemer = ({ isOpen, onClose, onRedemptionSuccess }) => {
    const { currentUser } = useAuth();
    const [couponCode, setCouponCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);

    const handleRedeem = async () => {
        if (!couponCode.trim()) {
            Swal.fire('Inválido', 'Por favor, ingresa un código de cupón.', 'warning');
            return;
        }
        if (!currentUser) {
            Swal.fire('Error', 'Debes iniciar sesión para canjear un cupón.', 'error');
            return;
        }

        setIsRedeeming(true);
        const codeToRedeem = couponCode.trim().toUpperCase();

        try {
            const q = query(collection(db, "redeemable_coupons"), where("code", "==", codeToRedeem));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("El código del cupón no es válido o no existe.");
            }

            const couponDoc = querySnapshot.docs[0];
            const couponData = couponDoc.data();

            if (couponData.isClaimed) {
                throw new Error("Este cupón ya ha sido reclamado.");
            }

            if (couponData.hasExpired || (couponData.expiresAt && couponData.expiresAt.toDate() < new Date())) {
                 throw new Error("Este cupón ha expirado.");
            }
            
            if (!couponData.batchId) {
                 throw new Error("Error de validación del cupón. Contacta a soporte.");
            }

            const userRef = doc(db, 'users', currentUser.uid);
            const batchRef = doc(db, "coupon_batches", couponData.batchId);
            
            const [userSnap, batchSnap] = await Promise.all([getDoc(userRef), getDoc(batchRef)]);

            if (!batchSnap.exists() || !batchSnap.data().isActive) {
                throw new Error("Esta promoción de cupones ya no se encuentra activa.");
            }
            
            const userData = userSnap.data();
            const claimedBatches = userData.claimedCouponBatches || [];
            if (claimedBatches.includes(couponData.batchId)) {
                throw new Error("Ya has canjeado un cupón de esta promoción.");
            }

            const batch = writeBatch(db);
            
            const couponRef = doc(db, 'redeemable_coupons', couponDoc.id);
            batch.update(couponRef, {
                isClaimed: true,
                claimedBy: currentUser.uid,
                claimedAt: serverTimestamp()
            });

            batch.update(userRef, {
                score: increment(couponData.points),
                claimedCouponBatches: arrayUnion(couponData.batchId)
            });

            await batch.commit();

            Swal.fire('¡Éxito!', `¡Has canjeado ${couponData.points} puntos!`, 'success');
            onRedemptionSuccess(couponData.points);
            setCouponCode('');
            onClose();

        } catch (error) {
            Swal.fire('Error al Canjear', error.message, 'error');
        } finally {
            setIsRedeeming(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="coupon-redeemer-overlay open">
            <div className="coupon-redeemer-modal">
                <button className="close-btn" onClick={onClose}><FaTimes /></button>
                <h3><FaTicketAlt /> Canjear Cupón</h3>
                <p>Ingresa tu código de cupón para reclamar tus puntos.</p>
                <div className="input-group">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="INGRESA TU CÓDIGO"
                        disabled={isRedeeming}
                    />
                    <button onClick={handleRedeem} disabled={isRedeeming}>
                        {isRedeeming ? <LoaderSpinner size="small-inline" /> : 'Canjear'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponRedeemer;
