// Splash Screen - PrintT
import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedRole = typeof window !== 'undefined' ? localStorage.getItem('appRole') : null;
      
      if (savedRole && user) {
        const dashboardMap: Record<string, string> = {
          'user': '/(tabs)',
          'pilot': '/(pilot)',
          'admin': '/(admin)'
        };
        const target = dashboardMap[savedRole as any] || '/role-selection';
        router.replace(target as any);


      } else if (user) {
        router.replace('/role-selection');
      } else {
        router.replace('/auth-otp');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user]);


  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        {/* Logo Placeholder - Using Material Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="print" size={80} color="#FFF" />
          </View>
          <Text style={styles.logoText}>PrintT</Text>
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Upload. Pay. Print.</Text>
          <Text style={styles.subtitle}>Smart printing at your fingertips</Text>
        </View>

        {/* Process Icons */}
        <View style={styles.processContainer}>
          <View style={styles.processStep}>
            <MaterialIcons name="upload-file" size={32} color="rgba(255,255,255,0.7)" />
            <Text style={styles.processLabel}>Upload</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.processStep}>
            <MaterialIcons name="payment" size={32} color="rgba(255,255,255,0.7)" />
            <Text style={styles.processLabel}>Pay</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.processStep}>
            <MaterialIcons name="print" size={32} color="rgba(255,255,255,0.7)" />
            <Text style={styles.processLabel}>Print</Text>
          </View>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.dotContainer}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, { animationDelay: `${i * 0.2}s` }]} />
            ))}
          </View>
        </View>

        <Text style={styles.initializing}>Initializing self-service terminal...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 96,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  processContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 80,
  },
  processStep: {
    alignItems: 'center',
    gap: 8,
  },
  processLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  loadingContainer: {
    marginBottom: 16,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.secondary,
  },
  initializing: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});
