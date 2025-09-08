import { NextResponse } from 'next/server'

export async function GET() {
  const csvContent = `title,type,status,widthM,heightM,dailyImpressions,lighting,owner,imageUrl,description,city,country,priceMonth,googleMapsLink
Valla Centro Comercial,Valla,DISPONIBLE,20.0,15.0,65000,true,Propietario Centro,/uploads/valla1.jpg,Valla publicitaria en el centro comercial principal,Madrid,España,1500.0,https://maps.google.com/...
Mupi Avenida Principal,Mupi,OCUPADO,5.0,3.0,45000,false,Publicidad Local,/uploads/mupi1.jpg,Mupi ubicado en avenida principal con alto tráfico,Barcelona,España,800.0,https://maps.google.com/...
Pantalla Digital Plaza,Pantalla,RESERVADO,10.0,4.0,85000,true,Empresa Digital,/uploads/pantalla1.jpg,Pantalla digital en plaza central con iluminación LED,Valencia,España,1200.0,https://maps.google.com/...`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="plantilla-soportes.csv"'
    }
  })
}
