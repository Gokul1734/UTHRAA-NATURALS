import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateDeliveryCharges, updateTaxCalculations } from '../../store/slices/cartSlice';
import deliveryChargesService from '../../services/deliveryChargesService';
import taxService from '../../services/taxService';
import mongoDBDataService from '../../services/mongoDBDataService';

const DeliveryChargesLoader = () => {
  const dispatch = useDispatch();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasLoadedRef.current) {
      console.log('🔍 Pricing data already loaded, skipping...');
      return;
    }

    const loadPricingData = async () => {
      try {
        console.log('🔍 Loading pricing data from MongoDB...');
        
        // Test MongoDB connection first
        const connectionTest = await mongoDBDataService.testMongoDBConnection();
        console.log('🔍 MongoDB connection test result:', connectionTest);

        if (!connectionTest.success) {
          console.warn('🔍 MongoDB connection test failed, using fallback data');
        }

        // Load both delivery charges and tax settings from MongoDB
        await Promise.all([
          deliveryChargesService.loadDeliveryCharges(),
          taxService.loadTaxSettings()
        ]);

        // Force enable tax if it's disabled (temporary fix)
        if (!taxService.taxSettings.isActive) {
          console.log('🔍 Tax is disabled, forcing enable...');
          await taxService.forceEnableTax();
        }
        
        // Update cart totals with new pricing data
        dispatch(updateDeliveryCharges());
        dispatch(updateTaxCalculations());

        // Mark as loaded to prevent future executions
        hasLoadedRef.current = true;

        // Get comprehensive status
        const status = await mongoDBDataService.getMongoDBStatus();
        console.log('🔍 MongoDB data loading completed:', status);

        // Validate data integrity
        const validation = mongoDBDataService.validateMongoDBData();
        if (!validation.deliveryCharges.isValid || !validation.taxSettings.isValid) {
          console.warn('🔍 MongoDB data validation warnings:', validation);
        }

      } catch (error) {
        console.error('🔍 Error loading pricing data from MongoDB:', error);
      }
    };

    loadPricingData();
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default DeliveryChargesLoader; 