import { View, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from './Typography';
import { Contact } from './RecipientSelection';
import {  TypographyVariant } from '../constants/enums';
import { EDGE_MARGIN } from '../constants/styles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CloseButton from './CloseButton';

interface ContactSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  contacts: Contact[];
  favorites: Contact[];
  onContactSelect: (contact: Contact) => void;
  onToggleFavorite: (contact: Contact) => void;
  title: string;
}

const ContactSelectionModal = ({
  visible,
  onClose,
  contacts,
  favorites,
  onContactSelect,
  onToggleFavorite,
  title,
}: ContactSelectionModalProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => {
        onContactSelect(item);
        onClose();
      }}
    >
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Typography
            variant={TypographyVariant.BODY_MEDIUM}
            color={theme.text.SOFT_WHITE}
            weight='600'
          >
            {item.name}
          </Typography>
          <TouchableOpacity onPress={() => onToggleFavorite(item)} style={styles.favoriteButton}>
            <MaterialCommunityIcons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={item.isFavorite ? theme.text.ERROR_RED : theme.text.LIGHT_GREY}
            />
          </TouchableOpacity>
        </View>
        <Typography
          variant={TypographyVariant.BODY_SMALL}
          color={theme.text.LIGHT_GREY}
          style={styles.contactAddress}
        >
          {item.address.slice(0, 8)}...{item.address.slice(-8)}
        </Typography>
      </View>
      <MaterialCommunityIcons name='chevron-right' size={20} color={theme.text.LIGHT_GREY} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name='account-outline' size={64} color={theme.text.LIGHT_GREY} />
      <Typography
        variant={TypographyVariant.TITLE_MEDIUM}
        color={theme.text.LIGHT_GREY}
        style={styles.emptyTitle}
      >
        No contacts found
      </Typography>
      <Typography
        variant={TypographyVariant.BODY_MEDIUM}
        color={theme.text.LIGHT_GREY}
        style={styles.emptyText}
      >
        {title === 'Contacts'
          ? "You don't have any contacts yet. Add some friends to make sending easier!"
          : "You don't have any favorites yet. Mark contacts as favorites for quick access!"}
      </Typography>
    </View>
  );

  const dataToShow = title === 'Favorites' ? favorites : contacts;

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={theme.gradients.PRIMARY.colors as [string, string, ...string[]]}
        start={theme.gradients.PRIMARY.start}
        end={theme.gradients.PRIMARY.end}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <CloseButton onPress={onClose} />
          <Typography
            variant={TypographyVariant.TITLE_LARGE}
            color={theme.text.SOFT_WHITE}
            weight='600'
          >
            {title}
          </Typography>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {dataToShow.length > 0 ? (
            <FlatList
              data={dataToShow}
              renderItem={renderContactItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: EDGE_MARGIN,
      paddingVertical: EDGE_MARGIN,
      borderBottomWidth: 1,
      borderBottomColor: theme.background.SEMI_TRANSPARENT_WHITE,
    },
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
      paddingHorizontal: EDGE_MARGIN,
    },
    listContainer: {
      paddingVertical: EDGE_MARGIN,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.background.SEMI_TRANSPARENT_WHITE,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.background.SEMI_TRANSPARENT_WHITE,
      ...theme.shadows.small,
    },
    contactInfo: {
      flex: 1,
    },
    contactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    contactAddress: {
      fontFamily: 'monospace',
      fontSize: 14,
    },
    favoriteButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.small,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: EDGE_MARGIN * 2,
    },
    emptyTitle: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      textAlign: 'center',
      lineHeight: 24,
    },
  });

export default ContactSelectionModal;
