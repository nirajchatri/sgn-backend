import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import schoolRouter from './school';
import noticesRouter from './notices';
import facilitiesRouter from './facilities';
import curriculumRouter from './curriculum';
import streamsRouter from './streams';
import housesRouter from './houses';
import blogRouter from './blog';
import facultyRouter from './faculty';
import testimonialsRouter from './testimonials';
import calendarRouter from './calendar';
import feesRouter from './fees';
import bannersRouter from './banners';
import announcementsRouter from './announcements';
import admissionsRouter from './admissions';
import contactRouter from './contact';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/school', schoolRouter);
router.use('/notices', noticesRouter);
router.use('/facilities', facilitiesRouter);
router.use('/curriculum', curriculumRouter);
router.use('/streams', streamsRouter);
router.use('/houses', housesRouter);
router.use('/blog', blogRouter);
router.use('/faculty', facultyRouter);
router.use('/testimonials', testimonialsRouter);
router.use('/calendar', calendarRouter);
router.use('/fees', feesRouter);
router.use('/banners', bannersRouter);
router.use('/announcements', announcementsRouter);
router.use('/admissions', admissionsRouter);
router.use('/contact', contactRouter);

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'SGN Website Content API',
    version: '1.0.0',
    endpoints: [
      'GET  /api/health',
      'POST /api/auth/login',
      'GET  /api/school',
      'GET  /api/notices',
      'GET  /api/facilities',
      'GET  /api/curriculum',
      'GET  /api/streams',
      'GET  /api/houses',
      'GET  /api/blog',
      'GET  /api/faculty',
      'GET  /api/testimonials',
      'GET  /api/calendar',
      'GET  /api/fees',
      'GET  /api/banners',
      'GET  /api/announcements',
      'POST /api/admissions',
      'POST /api/contact',
    ],
  });
});

export default router;
