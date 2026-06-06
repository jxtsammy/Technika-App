import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AVailableTask from './AvailableTasks';
import api from '../../api';

const CurrentTaskCard = ({ currentTask }) => {
  const getProgress = (status) => {
    if (status === 'pending') return '50%';
    if (status === 'completed') return '100%';
    return '0%';
  };

  return (
    <View style={styles.currentTaskContainer}>
      <Text style={styles.sectionTitle}>Current Task</Text>
      <View style={styles.currentTaskCard}>
        <Text style={styles.taskId}>
          {currentTask ? `#${currentTask._id.slice(-8).toUpperCase()}` : 'No active task'}
        </Text>
        <Text style={styles.taskTitle}>
          {currentTask ? currentTask.title : '—'}
        </Text>
        {currentTask && (
          <TouchableOpacity style={styles.progressButton}>
            <Text style={styles.progressButtonText}>View Progress</Text>
          </TouchableOpacity>
        )}
        <View style={styles.progressWrapper}>
          <View style={styles.progressBackground} />
          <View style={[styles.progressFill, { transform: [{ rotate: '140deg' }] }]} />
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>
              {getProgress(currentTask?.status)}  {/* 👈 only this line changed */}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const TaskTabs = ({ activeTab, setActiveTab }) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('pending')}>
      <Text style={[styles.tabTextPending, activeTab === 'pending' && styles.activeTabText]}>
        Pending Task
      </Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('available')}>
      <Text style={[styles.tabTextAvailable, activeTab === 'available' && styles.activeTabText]}>
        Available Task
      </Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('completed')}>
      <Text style={[styles.tabTextCompleted, activeTab === 'completed' && styles.activeTabText]}>
        Completed Task
      </Text>
    </TouchableOpacity>
  </View>
);

const TaskItem = ({ taskId, clientName, location, date, avatar }) => (
  <View style={styles.taskItem}>
    <Image source={{ uri: avatar }} style={styles.avatar} />
    <View style={styles.taskContent}>
      <View style={styles.taskHeader}>
        <View>
          <Text style={styles.taskIdText}>{taskId}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>
      <View style={styles.taskRow}>
        <View>
          <Text style={styles.clientText}>
            Client: <Text style={styles.clientName}>{clientName}</Text>
          </Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={16} color="#007a3f" />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Location</Text>
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call" size={20} color="#007a3f" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="message" size={20} color="#007a3f" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

const TaskScreen = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const [tasksRes, currentRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/current'),
      ]);

      const completed = tasksRes.data
        .filter(t => t.status === 'completed')
        .map(t => ({
          taskId: t.title,
          clientName: t.assignedTo?.firstName || 'N/A',
          location: t.location?.address || 'N/A',
          date: new Date(t.completedAt || t.updatedAt).toLocaleString(),
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10) + 11}`,
        }));

      setCompletedTasks(completed);
      setCurrentTask(currentRes.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <CurrentTaskCard currentTask={currentTask} />
        <TaskTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'available' && (
            <View style={styles.tasksContainer}>
              <AVailableTask />
            </View>
          )}
          {activeTab === 'pending' && (
            <View>
              <Text style={styles.pendingText}>No Pending Tasks</Text>
            </View>
          )}
          {activeTab === 'completed' &&
            completedTasks.map((task, index) => (
              <TaskItem key={index} {...task} />
            ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default TaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  currentTaskContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007a3f',
    marginBottom: 12,
  },
  currentTaskCard: {
    backgroundColor: '#007a3f',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    minHeight: 160,
  },
  taskId: {
    color: 'white',
    opacity: 0.8,
    marginBottom: 8,
  },
  taskTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  progressButtonText: {
    color: '#007a3f',
    fontWeight: '600',
  },
  progressWrapper: {
    position: 'absolute',
    right: 20,
    top: '55%',
    marginTop: -35,
    width: 83,
    height: 83,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 83,
    height: 83,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    position: 'absolute',
    width: 83,
    height: 83,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: 'white',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '90deg' }],
  },
  progressCircle: {
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 32,
    color: '#ffff',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
  },
  tabTextPending: {
    color: '#007a3f',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  tabTextAvailable: {
    color: '#007a3f',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  tabTextCompleted: {
    color: '#007a3f',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  activeTabText: {
    color: '#FFFFFF',
    backgroundColor: '#007a3f',
  },
  taskItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    backgroundColor: '#007a3f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientText: {
    color: '#666',
    marginBottom: 8,
  },
  clientName: {
    color: '#007a3f',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationBadge: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    color: '#666',
    fontSize: 12,
  },
  locationText: {
    color: '#000',
  },
  dateText: {
    color: '#007a3f',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    height: 40,
  },
  actionButton: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 8,
  },
  pendingText: {
    color: '#007a3f',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 150,
  },
  tasksContainer: {},
});