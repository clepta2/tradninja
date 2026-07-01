import type { PatternTemplate, Language } from './types';

function interpolate(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

export const PATTERNS: Record<string, PatternTemplate> = {
  greeting: {
    pt: 'Olá, {name}!',
    en: 'Hello, {name}!',
    es: 'Hola, {name}!',
    params: ['name'],
  },
  welcome: {
    pt: 'Bem-vindo ao {app}!',
    en: 'Welcome to {app}!',
    es: '¡Bienvenido a {app}!',
    params: ['app'],
  },
  confirmDelete: {
    pt: 'Tem certeza que deseja excluir {item}?',
    en: 'Are you sure you want to delete {item}?',
    es: '¿Estás seguro de que deseas eliminar {item}?',
    params: ['item'],
  },
  confirmAction: {
    pt: 'Confirmar {action}?',
    en: 'Confirm {action}?',
    es: '¿Confirmar {action}?',
    params: ['action'],
  },
  savingProgress: {
    pt: 'Salvando progresso...',
    en: 'Saving progress...',
    es: 'Guardando progreso...',
    params: [],
  },
  errorOccurred: {
    pt: 'Ocorreu um erro: {message}',
    en: 'An error occurred: {message}',
    es: 'Ocurrió un error: {message}',
    params: ['message'],
  },
  networkError: {
    pt: 'Erro de conexão. Verifique sua internet.',
    en: 'Connection error. Check your internet.',
    es: 'Error de conexión. Verifica tu internet.',
    params: [],
  },
  sessionExpired: {
    pt: 'Sessão expirada. Faça login novamente.',
    en: 'Session expired. Please log in again.',
    es: 'Sesión expirada. Inicia sesión de nuevo.',
    params: [],
  },
  workoutCompleted: {
    pt: 'Treino concluído! Excelente trabalho!',
    en: 'Workout completed! Great work!',
    es: '¡Entrenamiento completado! ¡Excelente trabajo!',
    params: [],
  },
  caloriesBurned: {
    pt: '{calories} kcal queimadas',
    en: '{calories} kcal burned',
    es: '{calories} kcal quemadas',
    params: ['calories'],
  },
  setsCompleted: {
    pt: '{count} séries concluídas',
    en: '{count} sets completed',
    es: '{count} series completadas',
    params: ['count'],
  },
  restTimer: {
    pt: '{seconds}s de descanso',
    en: '{seconds}s rest',
    es: '{seconds}s descanso',
    params: ['seconds'],
  },
  levelUp: {
    pt: 'Parabéns! Você subiu para o nível {level}!',
    en: 'Congratulations! You reached level {level}!',
    es: '¡Felicitaciones! ¡Subiste al nivel {level}!',
    params: ['level'],
  },
  achievementUnlocked: {
    pt: 'Conquista desbloqueada: {name}!',
    en: 'Achievement unlocked: {name}!',
    es: '¡Logro desbloqueado: {name}!',
    params: ['name'],
  },
  streakMessage: {
    pt: 'Você está com {days} dias seguidos!',
    en: 'You have a {days} day streak!',
    es: '¡Tienes una racha de {days} días!',
    params: ['days'],
  },
  xpEarned: {
    pt: '+{xp} XP ganho!',
    en: '+{xp} XP earned!',
    es: '¡+{xp} XP ganado!',
    params: ['xp'],
  },
  daysRemaining: {
    pt: '{days} dias restantes',
    en: '{days} days remaining',
    es: '{days} días restantes',
    params: ['days'],
  },
  minutesRemaining: {
    pt: '{minutes} minutos restantes',
    en: '{minutes} minutes remaining',
    es: '{minutes} minutos restantes',
    params: ['minutes'],
  },
  paymentSuccess: {
    pt: 'Pagamento realizado com sucesso!',
    en: 'Payment completed successfully!',
    es: '¡Pago realizado con éxito!',
    params: [],
  },
  subscriptionExpiring: {
    pt: 'Sua assinatura expira em {days} dias',
    en: 'Your subscription expires in {days} days',
    es: 'Tu suscripción expira en {days} días',
    params: ['days'],
  },
  waterLogged: {
    pt: '{ml}ml de água registrados!',
    en: '{ml}ml of water logged!',
    es: '¡{ml}ml de agua registrados!',
    params: ['ml'],
  },
  mealLogged: {
    pt: '{meal} registrada com sucesso!',
    en: '{meal} logged successfully!',
    es: '¡{meal} registrada con éxito!',
    params: ['meal'],
  },
  shareWorkout: {
    pt: 'Treinei com {app}! {name} - {duration}min',
    en: 'I trained with {app}! {name} - {duration}min',
    es: '¡Entrené con {app}! {name} - {duration}min',
    params: ['app', 'name', 'duration'],
  },
  friendChallenge: {
    pt: '{name} te desafiou para um treino!',
    en: '{name} challenged you to a workout!',
    es: '¡{name} te desafió a un entrenamiento!',
    params: ['name'],
  },
  permissionDenied: {
    pt: 'Permissão negada. Conceda acesso nas configurações.',
    en: 'Permission denied. Grant access in settings.',
    es: 'Permiso denegado. Concede acceso en configuración.',
    params: [],
  },
  dataExported: {
    pt: 'Dados exportados com sucesso!',
    en: 'Data exported successfully!',
    es: '¡Datos exportados con éxito!',
    params: [],
  },
  profileUpdated: {
    pt: 'Perfil atualizado com sucesso!',
    en: 'Profile updated successfully!',
    es: '¡Perfil actualizado con éxito!',
    params: [],
  },
  passwordChanged: {
    pt: 'Senha alterada com sucesso!',
    en: 'Password changed successfully!',
    es: '¡Contraseña cambiada con éxito!',
    params: [],
  },
  accountDeleted: {
    pt: 'Conta deletada permanentemente.',
    en: 'Account permanently deleted.',
    es: 'Cuenta eliminada permanentemente.',
    params: [],
  },
  weeklyReport: {
    pt: 'Seu relatório semanal está pronto!',
    en: 'Your weekly report is ready!',
    es: '¡Tu reporte semanal está listo!',
    params: [],
  },
  newFollower: {
    pt: '{name} começou a seguir você',
    en: '{name} started following you',
    es: '{name} comenzó a seguirte',
    params: ['name'],
  },
  postLiked: {
    pt: '{name} curtiu sua publicação',
    en: '{name} liked your post',
    es: '{name} le gustó tu publicación',
    params: ['name'],
  },
  commentReply: {
    pt: '{name} respondeu seu comentário',
    en: '{name} replied to your comment',
    es: '{name} respondió a tu comentario',
    params: ['name'],
  },
  offlineMode: {
    pt: 'Modo offline. Dados em cache.',
    en: 'Offline mode. Cached data.',
    es: 'Modo offline. Datos en caché.',
    params: [],
  },
  syncComplete: {
    pt: 'Sincronização concluída!',
    en: 'Sync complete!',
    es: '¡Sincronización completada!',
    params: [],
  },
  bodyMeasurementSaved: {
    pt: 'Medidas corporais salvas!',
    en: 'Body measurements saved!',
    es: '¡Medidas corporales guardadas!',
    params: [],
  },
  checkinSuccess: {
    pt: 'Check-in realizado! Bem-vindo!',
    en: 'Check-in complete! Welcome!',
    es: '¡Check-in realizado! ¡Bienvenido!',
    params: [],
  },
  weightGoalReached: {
    pt: 'Parabéns! Você atingiu sua meta de peso!',
    en: 'Congratulations! You reached your weight goal!',
    es: '¡Felicitaciones! ¡Alcanzaste tu meta de peso!',
    params: [],
  },
  restDay: {
    pt: 'Hoje é dia de descanso. Recupere-se!',
    en: "Today is rest day. Recover!",
    es: 'Hoy es día de descanso. ¡Recupérate!',
    params: [],
  },
  workoutReminder: {
    pt: 'Hora de treinar! Não perca seu streak!',
    en: "Time to work out! Don't break your streak!",
    es: '¡Hora de entrenar! ¡No pierdas tu racha!',
    params: [],
  },
  mealReminder: {
    pt: 'Hora de {meal}! Não esqueça de registrar.',
    en: "Time for {meal}! Don't forget to log it.",
    es: '¡Hora de {meal}! No olvides registrarlo.',
    params: ['meal'],
  },
  hydrationReminder: {
    pt: 'Beba água! Meta: {ml}ml por dia.',
    en: 'Drink water! Goal: {ml}ml per day.',
    es: '¡Bebe agua! Meta: {ml}ml por día.',
    params: ['ml'],
  },
};

export function interpolatePattern(
  key: string,
  params: Record<string, string | number>,
  target: Language = 'en'
): string {
  const pattern = PATTERNS[key];
  if (!pattern) return key;
  return interpolate(pattern[target], params);
}

export function getPattern(
  key: string
): PatternTemplate | undefined {
  return PATTERNS[key];
}
