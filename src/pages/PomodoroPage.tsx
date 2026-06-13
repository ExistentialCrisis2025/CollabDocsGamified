import { motion } from "framer-motion";
import TopBar from "../components/TopBar";
import PomodoroTimer from "../components/PomodoroTimer";
import LofiPlayer from "../components/LofiPlayer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { useLocation } from "react-router-dom";

const PomodoroPage = () => {
  const location = useLocation();
  const { taskId, taskTitle } = location.state || { taskId: null, taskTitle: "Personal Focus Session" };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <TopBar />
      
      <motion.div 
        className="mx-auto max-w-lg p-6 pt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="mb-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-indigo-500 font-medium hover:underline w-max">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
        </div>

        <PomodoroTimer taskId={taskId} taskTitle={taskTitle} />
        
        <LofiPlayer />

        <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
            <p>Use the Pomodoro technique to stay focused.</p>
            <p>You can configure your focus and break times by clicking the settings gear above.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PomodoroPage;