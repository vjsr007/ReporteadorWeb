using System;

namespace ReporteadorWeb.Models.Seguridad
{
	public partial class Usuario 
	{
        public int? UsuarioID { get; set; }			
		
        public string Nombre { get; set; }

        public string Dominio { get; set; }

        public string Login { get; set; }

        public string LoginAutorizador { get; set; }

        public string Pass { get; set; }

        public string Email { get; set; }

        public string IP { get; set; }
		
        public string Activo { get; set; }
		
        public string Rol { get; set; }
		
        public int? RolID { get; set; }
	}
}

