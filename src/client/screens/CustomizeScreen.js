import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CustomizeScreen = () => {
  //const [detoxModes, setDetoxModes] = useState([]);
  //const [blockedLocations, setBlockedLocations] = useState([]);
  //const [scheduledDowntimes, setScheduledDowntimes] = useState([]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Customize</Text>
      <Text style={styles.description}>Set custom app-blocking settings</Text>

      <Section
        title="Detox Modes"
        items={''}
        //items={detoxModes}
        
        //add functionality later
        //addLabel="Add new mode"
        //on press, navigate to new page to customize mode and add to array of modes
        />

      <Section
        title="Blocked Locations"
        items={''}
        //items={blockedLocations}

        //add functionality later
        //addLabel="Add new location"
        //on press, navigate to new page to customize location and add to array of locations
        />

      <Section
        title="Scheduled Downtime"
        items={''}
        //items={scheduledDowntimes}

        //add functionality later
        //addLabel="Add new downtime"
        //on press, navigate to new page to customize downtime and add to array of downtimes
        />
    </ScrollView>
  );
};

//later add in button function to add new
//also later add in functionality to edit button to navigate to edit page
const Section = ({ title, items }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {items.map((item, index) => (
      <View key={index} style={styles.itemRow}>
        <Text>{item}</Text>
        <Icon name="edit" size={20} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  screenTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'left',
    marginTop: 50,
  },
  description: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 18,
  },
  section: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
    minHeight:200,
    borderRadius: 30,
    padding:16,
  },
  sectionTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
  },
  itemRow: {

  },
});

export default CustomizeScreen;