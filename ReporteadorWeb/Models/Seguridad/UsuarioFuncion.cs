using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ReporteadorWeb.Models.Seguridad
{
    public class UsuarioFuncion
    {
        public int? UsuarioID {get; set;}

        public int? RolID {get; set;}

        public string Rol {get; set;}

        public long? FuncionID {get; set;}

        public string Funcion {get; set;}

        public long? FuncionPadreID {get; set;}

        public string FuncionPadre {get; set;}

        public string FuncionDescripcion {get; set;}

        public string Url {get; set;}

        public bool? Recordarme { get; set; }

        public string Foto { get; set; }

        public string NombreCompleto { get; set; }

        public string Metadata { get; set; }

        public bool? RolActivo { get; set; }

        public bool? FuncionActivo { get; set; }

        public string Nombre { get; set; }

        public bool? Activo { get; set; }
    }
}
