import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useCardStore } from '@/store/cardStore';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/Button';
import { 
  exportCSV,
  exportToGoogleSheets, 
  exportToExcel,
  isGoogleSheetsConnected,
  isExcelConnected,
  connectGoogleSheets,
  connectExcel
} from '@/utils/exportUtils';

export default function ExportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards } = useCardStore();
  const { user } = useUserStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'sheets' | 'excel'>('csv');
  
  const isPremiumUser = user?.subscriptionPlan !== 'free';
  const [googleConnected, setGoogleConnected] = useState(false);
  const [excelConnected, setExcelConnected] = useState(false);
  
  // Check connection status on component mount
  React.useEffect(() => {
    const checkConnections = async () => {
      const googleStatus = await isGoogleSheetsConnected();
      const excelStatus = await isExcelConnected();
      setGoogleConnected(googleStatus);
      setExcelConnected(excelStatus);
    };
    
    checkConnections();
  }, []);
  
  const handleConnect = async (type: 'sheets' | 'excel') => {
    setIsConnecting(true);
    
    try {
      let success = false;
      
      if (type === 'sheets') {
        success = await connectGoogleSheets();
        if (success) {
          setGoogleConnected(true);
          Alert.alert('Success', 'Google Sheets connected successfully! You can now export your cards to Google Sheets.');
        }
      } else {
        success = await connectExcel();
        if (success) {
          setExcelConnected(true);
          Alert.alert('Success', 'Excel/OneDrive connected successfully! You can now export your cards to Excel.');
        }
      }
      
      if (!success) {
        Alert.alert(
          'Connection Failed', 
          'Unable to connect at this time. Please check your internet connection and try again.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error', 
        'An error occurred while connecting. Please try again later.'
      );
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleExport = async () => {
    if (cards.length === 0) {
      Alert.alert('No Cards', 'You have no cards to export. Start by scanning some business cards first.');
      return;
    }
    
    if (exportType !== 'csv' && !isPremiumUser) {
      Alert.alert(
        'Premium Feature',
        'Exporting to spreadsheets is a premium feature. Would you like to upgrade your plan?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') }
        ]
      );
      return;
    }
    
    // Check connections for premium features
    if (exportType === 'sheets' && !googleConnected) {
      Alert.alert(
        'Connect Google Sheets',
        'Please connect your Google account first to export to Google Sheets.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Now', onPress: () => handleConnect('sheets') }
        ]
      );
      return;
    }
    
    if (exportType === 'excel' && !excelConnected) {
      Alert.alert(
        'Connect Excel/OneDrive',
        'Please connect your Microsoft account first to export to Excel.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Now', onPress: () => handleConnect('excel') }
        ]
      );
      return;
    }
    
    setIsExporting(true);
    
    try {
      if (exportType === 'csv') {
        await exportCSV(cards);
        Alert.alert(
          'Export Successful', 
          `Successfully exported ${cards.length} cards to CSV format.`
        );
      } else if (exportType === 'sheets') {
        await exportToGoogleSheets(cards);
        Alert.alert(
          'Export Successful', 
          `Successfully exported ${cards.length} cards to Google Sheets.`
        );
      } else if (exportType === 'excel') {
        await exportToExcel(cards);
        Alert.alert(
          'Export Successful', 
          `Successfully exported ${cards.length} cards to Excel.`
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed', 
        'There was an error exporting your cards. Please check your connection and try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <ScrollView style={[
      styles.container,
      { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }
    ]}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Cards</Text>
        <Text style={styles.subtitle}>
          Export your {cards.length} business cards to various formats
        </Text>
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            exportType === 'csv' && styles.selectedOption
          ]}
          onPress={() => setExportType('csv')}
        >
          <View style={styles.optionHeader}>
            <Ionicons name="document-text" size={24} color={Colors.light.primary} />
            <Text style={styles.optionTitle}>CSV File</Text>
            {exportType === 'csv' && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          
          <Text style={styles.optionDescription}>
            Export as a CSV file with properly mapped fields: Name, Title, Company, Email, Phone, Website, Address, Notes, Date Added
          </Text>
          
          <View style={styles.optionFooter}>
            <Text style={styles.availableText}>✓ Available on all plans</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.optionCard,
            exportType === 'sheets' && styles.selectedOption,
            !isPremiumUser && styles.disabledOption
          ]}
          onPress={() => isPremiumUser && setExportType('sheets')}
        >
          <View style={styles.optionHeader}>
            <Ionicons name="document-text" size={24} color={isPremiumUser ? Colors.light.primary : Colors.light.disabled} />
            <Text style={[styles.optionTitle, !isPremiumUser && styles.disabledText]}>
              Google Sheets
            </Text>
            {exportType === 'sheets' && isPremiumUser && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          
          <Text style={[styles.optionDescription, !isPremiumUser && styles.disabledText]}>
            Export directly to Google Sheets for easy collaboration and real-time sharing with your team
          </Text>
          
          <View style={styles.optionFooter}>
            {isPremiumUser ? (
              <View style={styles.connectionStatus}>
                {googleConnected ? (
                  <Text style={styles.connectedText}>✓ Connected to Google</Text>
                ) : (
                  <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={() => handleConnect('sheets')}
                    disabled={isConnecting}
                  >
                    <Ionicons name="link" size={14} color={Colors.light.primary} />
                    <Text style={styles.connectText}>
                      {isConnecting ? 'Connecting...' : 'Connect Google'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium Feature</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.optionCard,
            exportType === 'excel' && styles.selectedOption,
            !isPremiumUser && styles.disabledOption
          ]}
          onPress={() => isPremiumUser && setExportType('excel')}
        >
          <View style={styles.optionHeader}>
            <Ionicons name="document-text" size={24} color={isPremiumUser ? Colors.light.primary : Colors.light.disabled} />
            <Text style={[styles.optionTitle, !isPremiumUser && styles.disabledText]}>
              Excel/OneDrive
            </Text>
            {exportType === 'excel' && isPremiumUser && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          
          <Text style={[styles.optionDescription, !isPremiumUser && styles.disabledText]}>
            Export to Excel format and save to OneDrive for seamless Microsoft Office integration
          </Text>
          
          <View style={styles.optionFooter}>
            {isPremiumUser ? (
              <View style={styles.connectionStatus}>
                {excelConnected ? (
                  <Text style={styles.connectedText}>✓ Connected to Microsoft</Text>
                ) : (
                  <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={() => handleConnect('excel')}
                    disabled={isConnecting}
                  >
                    <Ionicons name="link" size={14} color={Colors.light.primary} />
                    <Text style={styles.connectText}>
                      {isConnecting ? 'Connecting...' : 'Connect Microsoft'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium Feature</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Export Information</Text>
        <Text style={styles.infoText}>
          • You have {cards.length} cards ready to export
        </Text>
        <Text style={styles.infoText}>
          • All contact details will be properly organized in their respective columns
        </Text>
        <Text style={styles.infoText}>
          • CSV format includes: Name, Title, Company, Email, Phone, Website, Address, Notes, Date Added
        </Text>
        <Text style={styles.infoText}>
          • Business card images are not included in exports (contact data only)
        </Text>
        {!isPremiumUser && (
          <Text style={styles.infoText}>
          • Upgrade to a premium plan to unlock Google Sheets and Excel export options
          </Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={`Export ${cards.length} Cards`}
          onPress={handleExport}
          variant="primary"
          loading={isExporting}
          disabled={isExporting || cards.length === 0}
          icon={<Ionicons name="download" size={20} color="white" style={{ marginRight: 8 }} />}
          style={styles.exportButton}
        />
        
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          disabled={isExporting}
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  optionsContainer: {
    padding: 16,
  },
  optionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.highlight,
  },
  disabledOption: {
    opacity: 0.7,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  disabledText: {
    color: Colors.light.textSecondary,
  },
  optionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  availableText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: '500',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: '500',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.highlight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  connectText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  premiumBadge: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 24,
  },
  exportButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});