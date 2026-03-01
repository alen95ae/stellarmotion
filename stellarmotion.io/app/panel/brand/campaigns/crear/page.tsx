import CreateCampaignWizard from '@/components/campaigns/CreateCampaignWizard';

export const metadata = {
  title: 'Crear campaña | Stellarmotion',
  description: 'Asistente para crear una nueva campaña OOH/DOOH',
};

export default function CrearCampaignPage() {
  return <CreateCampaignWizard />;
}
